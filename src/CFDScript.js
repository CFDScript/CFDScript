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

/**
 * Partial Differential Equations (PDE) solver using the Finite Element Method (FEM)
 * @param {*} solverScript - Parameter specifying the type of solver
 * @param {*} compuMesh - Object containing computational mesh details
 * @param {*} boundCond - Object containing boundary conditions
 * @returns 
 */
export function CFDScript(solverScript, compuMesh, boundCond) {
  let jac = []; // Jacobian matrix
  let res = []; // Galerkin residuals
  let nnx; // Total number of nodes along x-axis
  let nny; // Total number of nodes along y-axis
  let axpt = []; // Array to store x-coordinates of nodes (local numbering)
  let aypt = []; // Array to store y-coordinates of nodes (local numbering)
  let u = []; // Solution vector

  // Assembly matrices
  console.time('assemblyMatrices');
  if (solverScript === 'solidHeatScript') {
    console.log("Solver:", solverScript);
    ({ jac, res, nnx, nny, axpt, aypt } = createSolidHeatMat2D(compuMesh, boundCond));
  }
  console.timeEnd('assemblyMatrices');
  let nx = nnx; // Assign the value of nnx to nx
  let ny = nny; // Assign the value of nny to ny

  // System solving
  console.time('systemSolving');
  u = math.lusolve(jac, res); // Solve the system of linear equations using LU decomposition
  // Alternatively, you can use the Gaussian Elimination method to solve the system of equations: 
  //u = gaussElim(jac, res);
  console.timeEnd('systemSolving');

  // Debugger;
  //console.log(x); // Log the solution to the console

  // Return the solution matrix
  return { u, nx, ny, axpt, aypt };
}