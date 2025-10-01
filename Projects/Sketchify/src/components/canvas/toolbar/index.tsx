import React from 'react';
import { History } from './history';
import { Shapes } from './shapes';
import { Zoom } from './zoom';

export const Toolbar = () => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
      <History />
      <Shapes />
      <Zoom />
    </div>
  );
};