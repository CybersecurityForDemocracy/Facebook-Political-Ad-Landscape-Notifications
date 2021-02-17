import React from 'react';
import { render } from '@testing-library/react';

import BarGraph from './BarGraph';
import graphColors from '../styles/graphs';

const barGraphProps = {
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

it('Should render the bar graph with the given props', () => {
  const component = render(
    <BarGraph
      height={barGraphProps.height}
      width={barGraphProps.width}
      data={barGraphProps.data}
      xDataKey={barGraphProps.xDataKey}
      graphDataKey={barGraphProps.graphDataKey}
      colors={barGraphProps.colors}
    />,
  );
  const components = component.getAllByText('Part', { exact: false });

  // should render
  expect(component).toBeTruthy();
  // should have display Part A - D
  expect(components).toHaveLength(4);
});
