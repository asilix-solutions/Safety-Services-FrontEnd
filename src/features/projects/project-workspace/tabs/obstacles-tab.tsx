import React from "react";
import { ObstaclesViewModel } from "../view-models/project-workspace.viewmodel";
import { ObstacleList } from "../components/obstacle-list";

interface ObstaclesTabProps {
  viewModel: ObstaclesViewModel;
  t: any;
}

export function ObstaclesTab({ viewModel, t }: ObstaclesTabProps) {
  return (
    <ObstacleList viewModel={viewModel} t={t} />
  );
}
