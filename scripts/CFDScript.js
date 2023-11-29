//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { createSolidHeatMat2D } from './solidHeatScript.js';
import { gaussElim } from './auxFunScript.js';

export function CFDScript(nex, ney, xlast, ylast, solverScript, boundaryConditions) {
  let jac = []; // Jacobian matrix
  let res = []; // Galerkin residuals
  let nnx; // Total number of nodes along x-axis
  let nny; // Total number of nodes along y-axis
  let axpt = []; // Array to store x-coordinates of nodes (local numbering)
  let aypt = []; // Array to store y-coordinates of nodes (local numbering)
  let u = []; // Solution vector
  
  // Assembly matrices
  if (solverScript === 'solidHeatScript') {
    console.log(solverScript, "solver");
    ({ jac, res, nnx, nny, axpt, aypt } = createSolidHeatMat2D(nex, ney, xlast, ylast, boundaryConditions));
  }
  let nx = nnx; // Assign the value of nnx to nx
  let ny = nny; // Assign the value of nny to ny
  
  // System solving
  u = math.lusolve(jac, res); // Solve the system of linear equations using LU decomposition
  // Alternatively, you can use the gauss function to solve the system: u = gaussElim(jac, res);

  // Debugger;
  //console.log(x); // Log the solution to the console

  // Return the solution matrix
  return { u, nx, ny, axpt, aypt };
}