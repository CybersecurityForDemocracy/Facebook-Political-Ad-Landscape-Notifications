import React from 'react';
import BarGraph from '../graphs/BarGraph';
import LineGraph from '../graphs/LineGraph';

const dummyData = [
  { name: 'SEIU', Trump: 400, Biden: 200 },
  { name: 'Unite for Colorado', Trump: 300, Biden: 300 },
  { name: 'Colorado Way', Trump: 300, Biden: 400 },
  { name: 'Ready CO', Trump: 200, Biden: 300 },
  { name: 'Secure Our Savings', Trump: 200, Biden: 100 },
];

function GraphSample() {
  const renderGraph = () => (
    <BarGraph
      data={dummyData}
      xDataKey="name"
      graphDataKey={['Trump', 'Biden']}
      colors={['#FF646A', '#397DFF']}
      legend
      showBarLabel
    />
  );

  const renderLineGraph = () => (
    <LineGraph
      data={dummyData}
      xDataKey="name"
      graphDataKey={['Trump', 'Biden']}
      colors={['#FF646A', '#397DFF']}
      legend
    />
  );

  return (
    <div className="graph-sample">
      <div style={{ display: 'inline-block', width: '40%' }}>
        {renderGraph()}
      </div>
      <div
        style={{ display: 'inline-block', width: '40%', marginLeft: '1rem' }}
      >
        {renderLineGraph()}
      </div>
    </div>
  );
}

export default GraphSample;
