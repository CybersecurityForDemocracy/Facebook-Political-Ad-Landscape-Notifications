import React from 'react';
import { render } from '@testing-library/react';

import LineGraph from './LineGraph';
import graphColors from '../styles/graphs';

const lineGraphProps = {
  height: 300,
  width: 600,
  data: [
    {
      name: 'Part A',
      value: 100,
    },
    {
      name: 'Part B',
      value: 100,
    },
    {
      name: 'Part C',
      value: 200,
    },
    {
      name: 'Part D',
      value: 300,
    },
  ],
  xDataKey: 'name',
  graphDataKey: ['value'],
  colors: [graphColors.blue],
};

it('Should render the line graph with the given props', () => {
  const component = render(
    <LineGraph
      height={lineGraphProps.height}
      width={lineGraphProps.width}
      data={lineGraphProps.data}
      xDataKey={lineGraphProps.xDataKey}
      graphDataKey={lineGraphProps.graphDataKey}
      colors={lineGraphProps.colors}
    />,
  );
  const components = component.getAllByText('Part', { exact: false });

  // should render
  expect(component).toBeTruthy();
  // should have display Part A - D
  expect(components).toHaveLength(4);
});
