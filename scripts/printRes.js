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

export function plot2DSolution(x, nx, ny, axpt, aypt) {   
  // Reshape the axpt and aypt arrays to match the grid dimensions
  let reshapedAxpt = math.reshape(Array.from(axpt), [nx, ny]);
  let reshapedAypt = math.reshape(Array.from(aypt), [nx, ny]);

  // Reshape the solution array to match the grid dimensions
  let reshapedX = math.reshape(Array.from(x), [nx, ny]);

  // Create the contour plot data
  let data = [{
    z: reshapedX,
    type: 'contour',
    contours: {
      coloring: 'heatmap'
    },
    x: reshapedAypt[0], //(needs correction)
    y: reshapedAypt[0]
  }];

  // Set the layout for the contour plot
  let layout = {
    title: 'Solution (Contour Plot)',
    width: 500,
    height: 500,
    xaxis: { title: 'x' },
    yaxis: { title: 'y' }
  };

  // Create the contour plot
  Plotly.newPlot('plot', data, layout);   
}
