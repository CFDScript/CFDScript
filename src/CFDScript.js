//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { createSolidHeatMat2D } from "./solidHeatScript.js";

/**
 * Partial Differential Equations (PDE) solver using the Finite Element Method (FEM)
 * @param {*} solverScript - Parameter specifying the type of solver
 * @param {*} meshConfig - Object containing computational mesh details
 * @param {*} boundaryConditions - Object containing boundary conditions
 * @returns
 */
export function CFDScript(solverScript, meshConfig, boundaryConditions) {
  let jacobianMatrix = []; // Jacobian matrix
  let residualVector = []; // Galerkin residuals
  let totalNodesX; // Total number of nodes along x-axis
  let totalNodesY; // Total number of nodes along y-axis
  let nodeXCoordinates = []; // Array to store x-coordinates of nodes (local numbering)
  let nodeYCoordinates = []; // Array to store y-coordinates of nodes (local numbering)
  let solutionVector = []; // Solution vector

  // Assembly matrices
  console.time("assemblyMatrices");
  if (solverScript === "solidHeatScript") {
    console.log("Solver:", solverScript);
    ({
      jacobianMatrix,
      residualVector,
      totalNodesX,
      totalNodesY,
      nodeXCoordinates,
      nodeYCoordinates,
    } = createSolidHeatMat2D(meshConfig, boundaryConditions));
  }
  console.timeEnd("assemblyMatrices");
  let numNodesX = totalNodesX; // Assign the value of totalNodesX to numNodesX
  let numNodesY = totalNodesY; // Assign the value of totalNodesY to numNodesY

  // System solving
  console.time("systemSolving");
  solutionVector = math.lusolve(jacobianMatrix, residualVector); // Solve the system of linear equations using LU decomposition
  console.timeEnd("systemSolving");

  // Debugger;
  //console.log(x); // Log the solution to the console

  // Return the solution matrix
  return {
    solutionVector,
    numNodesX,
    numNodesY,
    nodeXCoordinates,
    nodeYCoordinates,
  };
}
