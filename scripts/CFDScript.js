//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

// Import the createLaplace2DMat function from './laplace2DSolver.js'
import { createLaplace2DMat } from './laplace2DSolver.js';
// Import the gauss function from './auxFun.js'
import { gauss } from './auxFun.js';

export function CFDScript() {

  // Definitions
  let x = []; // Initialize x as an empty array
  const nex = 8; // Number of elements in x-direction
  const ney = 8; // Number of elements in y-direction
  const xlast = 1; // Last x-coordinate
  const ylast = 1; // Last y-coordinate
  
  // Assembly matrices
  let { jac, res, nnx, nny, axpt, aypt } = createLaplace2DMat(nex, ney, xlast, ylast); // Call createLaplaceMat to assemble the matrices
  let nx = nnx; // Assign the value of nnx to nx
  let ny = nny; // Assign the value of nny to ny
  
  // System solving
  x = math.lusolve(jac, res); // Solve the system of linear equations using LU decomposition
  // Alternatively, you can use the gauss function to solve the system: x = gauss(jac, res);

  // Debugger; 
  //console.log("cfdscript");
  //console.log(x); // Log the solution to the console

  // Return the solution matrix
  return { x, nx, ny, axpt, aypt };
}
