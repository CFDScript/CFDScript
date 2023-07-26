//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { CFDScript } from './CFDScript.js';

export function plotSol2D(u, nx, ny, axpt, aypt) {   
  // Reshape the axpt and aypt arrays to match the grid dimensions
  let reshapedAxpt = math.reshape(Array.from(axpt), [nx, ny]);
  let reshapedAypt = math.reshape(Array.from(aypt), [nx, ny]);

  // Reshape the solution array to match the grid dimensions
  let reshapedU = math.reshape(Array.from(u), [nx, ny]);

  // Transpose the reshapedX array to get column-wise data
  let transposedReshapedU = math.transpose(reshapedU);

  // Create x array for the contour plot
  let reshapedXForPlot = [];
  for (let i = 0; i < nx * ny; i += ny) {
    let xValue = axpt[i];
    reshapedXForPlot.push(xValue);
  }
  
  // Create the contour plot data
  let data = [{
    z: transposedReshapedU,
    type: 'contour',
    contours: {
      coloring: 'heatmap'
    },
    x: reshapedXForPlot,
    y: reshapedAypt[0]
  }];

  // Plot resizing
  let maxReshapedXForPlot = Math.max(...reshapedXForPlot);
  let maxReshapedAypt = Math.max(...reshapedAypt[0]);
  let plotWidth = 500 * maxReshapedXForPlot;
  let plotHeight = 500 * maxReshapedAypt;

  // Set the layout for the contour plot
  let layout = {
    title: 'Solution (Contour Plot)',
    //width: plotWidth,
    //height: plotHeight,
    width: 500,
    height: 500,
    xaxis: { title: 'x' },
    yaxis: { title: 'y' }
  };

  // Create the contour plot
  Plotly.newPlot('plot', data, layout);   
}
