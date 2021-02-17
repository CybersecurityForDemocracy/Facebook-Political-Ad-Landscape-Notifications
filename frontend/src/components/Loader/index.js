import React from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';

const data = [{ name: 'L1', value: 98 }];

const circleSize = 300;

function Loader() {
  return (
    <div className={'loader'}>
      <RadialBarChart
        width={circleSize}
        height={circleSize}
        cx={circleSize / 2}
        cy={circleSize / 2}
        innerRadius={40}
        outerRadius={48}
        barSize={10}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          clockWise
          dataKey="value"
          cornerRadius={circleSize / 2}
          fill="#836EFB"
        />
      </RadialBarChart>
    </div>
  );
}

export default Loader;
