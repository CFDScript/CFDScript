//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { createLaplaceMat2D } from './createMat.js';
import { gauss } from './auxFun.js';

export function CFDScript() {

  // Definitions
  let u = []; // Initialize x as an empty array
  const nex = 5; // Number of elements in x-direction
  const ney = 5; // Number of elements in y-direction
  const xlast = 1; // Last x-coordinate
  const ylast = 1; // Last y-coordinate
  
  // Assembly matrices
  let { jac, res, nnx, nny, axpt, aypt } = createLaplaceMat2D(nex, ney, xlast, ylast); // Call createLaplaceMat to assemble the matrices
  let nx = nnx; // Assign the value of nnx to nx
  let ny = nny; // Assign the value of nny to ny
  
  // System solving
  u = math.lusolve(jac, res); // Solve the system of linear equations using LU decomposition
  // Alternatively, you can use the gauss function to solve the system: u = gauss(jac, res);

  // Debugger; 
  //console.log("cfdscript");
  //console.log(x); // Log the solution to the console

  // Return the solution matrix
  return { u, nx, ny, axpt, aypt };
}
