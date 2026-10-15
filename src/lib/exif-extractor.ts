/**
 * High-performance, zero-dependency client-side EXIF metadata extractor for JPEG images.
 * Extracts GPS coordinates (Latitude/Longitude), Capture Timestamp, Device Make, and Model
 * directly from raw ArrayBuffer before any compression or canvas operations occur,
 * fulfilling Amanix auditability and geofence verification requirements.
 */

export interface ExifMetadata {
  hasGps: boolean;
  latitude: number | null;
  longitude: number | null;
  captureTimestampUtc: string | null;
  deviceMake: string | null;
  deviceModel: string | null;
}

/**
 * Extracts EXIF metadata from a File or Blob instance.
 */
export async function extractExifFromFile(file: File | Blob): Promise<ExifMetadata> {
  try {
    const arrayBuffer = await file.slice(0, 131072).arrayBuffer(); // Read first 128KB (where EXIF headers reside)
    return parseExifFromArrayBuffer(arrayBuffer);
  } catch (error) {
    console.warn("EXIF extraction encountered a parsing error:", error);
    return fallbackExif();
  }
}

function fallbackExif(): ExifMetadata {
  return {
    hasGps: false,
    latitude: null,
    longitude: null,
    captureTimestampUtc: null,
    deviceMake: null,
    deviceModel: null,
  };
}

/**
 * Parses raw ArrayBuffer for TIFF EXIF markers and GPS IFD pointers.
 */
export function parseExifFromArrayBuffer(buffer: ArrayBuffer): ExifMetadata {
  const view = new DataView(buffer);

  // Check JPEG SOI marker (0xFFD8)
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
    return fallbackExif();
  }

  let offset = 2;
  const length = view.byteLength;

  while (offset < length - 2) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    // Check for APP1 marker (0xFFE1)
    if (marker === 0xffe1) {
      const app1Length = view.getUint16(offset, false);
      offset += 2;

      // Verify "Exif\0\0" header (0x457869660000)
      if (
        view.getUint32(offset, false) === 0x45786966 &&
        view.getUint16(offset + 4, false) === 0x0000
      ) {
        return readTiffHeader(view, offset + 6);
      }
      offset += app1Length - 2;
    } else if ((marker & 0xff00) === 0xff00) {
      // Skip other JPEG markers
      if (marker === 0xffda || marker === 0xffd9) break; // SOS or EOI
      const sectionLength = view.getUint16(offset, false);
      offset += sectionLength;
    } else {
      break;
    }
  }

  return fallbackExif();
}

function readTiffHeader(view: DataView, tiffOffset: number): ExifMetadata {
  // Check endianness: "II" (0x4949) Little Endian, "MM" (0x4D4D) Big Endian
  const endianMarker = view.getUint16(tiffOffset, false);
  const littleEndian = endianMarker === 0x4949;

  // Verify TIFF 42 constant
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) {
    return fallbackExif();
  }

  const ifd0Offset = view.getUint32(tiffOffset + 4, littleEndian);
  let currentOffset = tiffOffset + ifd0Offset;

  let deviceMake: string | null = null;
  let deviceModel: string | null = null;
  let dateTime: string | null = null;
  let gpsOffset: number | null = null;

  if (currentOffset + 2 > view.byteLength) return fallbackExif();
  const entriesCount = view.getUint16(currentOffset, littleEndian);
  currentOffset += 2;

  for (let i = 0; i < entriesCount; i++) {
    const entryOffset = currentOffset + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);

    if (tag === 0x010f) {
      // Make
      deviceMake = readString(view, entryOffset, tiffOffset, littleEndian);
    } else if (tag === 0x0110) {
      // Model
      deviceModel = readString(view, entryOffset, tiffOffset, littleEndian);
    } else if (tag === 0x0132 || tag === 0x9003) {
      // DateTime or DateTimeOriginal
      dateTime = readString(view, entryOffset, tiffOffset, littleEndian);
    } else if (tag === 0x8825) {
      // GPS IFD Pointer
      gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
    }
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  if (gpsOffset !== null) {
    const gpsData = readGpsData(view, tiffOffset + gpsOffset, tiffOffset, littleEndian);
    latitude = gpsData.latitude;
    longitude = gpsData.longitude;
  }

  let formattedDate: string | null = null;
  if (dateTime) {
    // Convert EXIF "YYYY:MM:DD HH:MM:SS" to ISO "YYYY-MM-DDTHH:MM:SSZ"
    const parts = dateTime.trim().split(" ");
    if (parts.length === 2) {
      const d = parts[0].replace(/:/g, "-");
      formattedDate = new Date(`${d}T${parts[1]}Z`).toISOString();
    }
  }

  return {
    hasGps: latitude !== null && longitude !== null,
    latitude,
    longitude,
    captureTimestampUtc: formattedDate || new Date().toISOString(),
    deviceMake,
    deviceModel,
  };
}

function readGpsData(
  view: DataView,
  offset: number,
  tiffOffset: number,
  littleEndian: boolean
): { latitude: number | null; longitude: number | null } {
  if (offset + 2 > view.byteLength) return { latitude: null, longitude: null };
  const entriesCount = view.getUint16(offset, littleEndian);
  const currentOffset = offset + 2;

  let latRef: string | null = null;
  let latVals: number[] | null = null;
  let lonRef: string | null = null;
  let lonVals: number[] | null = null;

  for (let i = 0; i < entriesCount; i++) {
    const entryOffset = currentOffset + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);

    if (tag === 0x0001) {
      // GPSLatitudeRef
      latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    } else if (tag === 0x0002) {
      // GPSLatitude
      latVals = readRationals(view, entryOffset, tiffOffset, littleEndian, 3);
    } else if (tag === 0x0003) {
      // GPSLongitudeRef
      lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    } else if (tag === 0x0004) {
      // GPSLongitude
      lonVals = readRationals(view, entryOffset, tiffOffset, littleEndian, 3);
    }
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  if (latVals && latVals.length === 3) {
    latitude = latVals[0] + latVals[1] / 60 + latVals[2] / 3600;
    if (latRef === "S") latitude = -latitude;
  }

  if (lonVals && lonVals.length === 3) {
    longitude = lonVals[0] + lonVals[1] / 60 + lonVals[2] / 3600;
    if (lonRef === "W") longitude = -longitude;
  }

  return { latitude, longitude };
}

function readString(
  view: DataView,
  entryOffset: number,
  tiffOffset: number,
  littleEndian: boolean
): string | null {
  const count = view.getUint32(entryOffset + 4, littleEndian);
  if (count <= 0) return null;

  const valueOffset =
    count <= 4 ? entryOffset + 8 : tiffOffset + view.getUint32(entryOffset + 8, littleEndian);

  if (valueOffset + count > view.byteLength) return null;

  const chars: number[] = [];
  for (let i = 0; i < count; i++) {
    const code = view.getUint8(valueOffset + i);
    if (code === 0) break; // null terminator
    chars.push(code);
  }
  return String.fromCharCode(...chars).trim();
}

function readRationals(
  view: DataView,
  entryOffset: number,
  tiffOffset: number,
  littleEndian: boolean,
  expectedCount: number
): number[] | null {
  const count = view.getUint32(entryOffset + 4, littleEndian);
  if (count < expectedCount) return null;

  const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
  if (valueOffset + expectedCount * 8 > view.byteLength) return null;

  const results: number[] = [];
  for (let i = 0; i < expectedCount; i++) {
    const num = view.getUint32(valueOffset + i * 8, littleEndian);
    const den = view.getUint32(valueOffset + i * 8 + 4, littleEndian);
    results.push(den === 0 ? 0 : num / den);
  }
  return results;
}

/**
 * Calculates Great-Circle distance between two coordinates in meters (Haversine formula)
 * to verify if captured photo falls within the project site geofence radius.
 */
export function calculateGeofenceDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
