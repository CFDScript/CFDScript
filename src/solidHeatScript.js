//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { genStructMesh2D, nodNumStruct2D } from './genMeshScript.js';
import { basisFunQuad2D } from './basisFunScript.js';

/**
 * Generate the matrix and the residual vector for the Finite Element Method in two dimensions
 * @param {*} compuMesh - Object containing computational mesh details
 * @param {*} boundCond - Object containing boundary conditions
 * @returns 
 */
export function createSolidHeatMat2D(compuMesh, boundCond) {

  // Extract mesh details from the configuration object
  const {
      nex, // Number of elements in x-direction
      ney, // Number of elements in y-direction
      xlast, // Max x-coordinate (m) of the domain
      ylast, // Max y-coordinate (m) of the domain
  } = compuMesh;

  // Generate x-y coordinates using genStructMesh2D function
  let { axpt, aypt, nnx, nny } = genStructMesh2D(nex, ney, xlast, ylast);

  // Generate nop array
  let nop = nodNumStruct2D(nex, ney, nnx, nny);

  // Initialize variables for matrix assembly
  const ne = nex * ney; // Total number of elements
  const np = nnx * nny; // Total number of nodes
  let RobCondFlagTop = new Array(ne).fill(0); // Robin boundary condition flag (elements at the top side of the domain)
  let RobCondFlagBottom = new Array(ne).fill(0); // Robin boundary condition flag (elements at the bottom side of the domain)
  let RobCondFlagLeft = new Array(ne).fill(0); // Robin boundary condition flag (elements at the left side of the domain)
  let RobCondFlagRight = new Array(ne).fill(0); // Robin boundary condition flag (elements at the right side of the domain)
  let dirCondFlag = new Array(np).fill(0); // Dirichlet boundary condition flag
  let dirCondVal = new Array(np).fill(0); // Dirichlet boundary condition value
  let ngl = []; // Local nodal numbering
  let gp = []; // Gauss points
  let wgp = []; // Gauss weights
  let phx = []; // The x-derivative of the basis function
  let phy = []; // The y-derivative of the basis function
  let res = []; // Galerkin residuals
  let jac = []; // Jacobian matrix
  let x; // x-coordinate (physical coordinates)
  let y; // y-coordinate (physical coordinates)
  let x1; // ksi-derivative of x
  let x2; // eta-derivative of x (ksi and eta are natural coordinates that vary within a reference element)
  let y1; // ksi-derivative of y
  let y2; // eta-derivative of y
  let dett; // The jacobian of the isoparametric mapping

  // Initialize jac and res arrays
  for (let i = 0; i < np; i++) {
    res[i] = 0;
    jac.push([]);
    for (let j = 0; j < np; j++) {
      jac[i][j] = 0;
    }
  }

  // Extract boundary conditions from the configuration object
  const {
    topBound,
    bottomBound,
    leftBound,
    rightBound,
    robinHeatTranfCoeff,
    robinExtTemp
  } = boundCond;

  // Check for elements to impose Robin boundary conditions
  for (let i = 0; i < ne - ney; i += ney) { // Elements along y=yfirst (bottom side of the domain)
     if (bottomBound[0] == "robin") {
       RobCondFlagBottom[i] = 1;
	 }
  }
  for (let i = 0; i < ney; i++) { // Elements along x=xfirst (left side of the domain)
     if (leftBound[0] == "robin") {
       RobCondFlagLeft[i] = 1;
	 }
  }
  for (let i = ney - 1; i < ne; i += ney) { // Elements along y=ylast (top side of the domain)
     if (topBound[0] == "robin") {
       RobCondFlagTop[i] = 1;
	 }
  }
  for (let i = ne - ney; i < ne; i++) { // Elements along x=xlast (right side of the domain)
     if (rightBound[0] == "robin") {
       RobCondFlagRight[i] = 1;
	 }
  }

  // Matrix assembly
  for (let i = 0; i < ne; i++) {

    for (let j = 0; j < 9; j++) {
      ngl[j] = nop[i][j] - 1;
    }

    // Gauss points and weights
    gp[0] = (1 - (3 / 5) ** 0.5) / 2;
    gp[1] = 0.5;
    gp[2] = (1 + (3/5) ** 0.5) / 2;
    wgp[0] = 5 / 18;
    wgp[1] = 8 / 18;
    wgp[2] = 5 / 18;

    // Loop over Gauss points
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {

        // Initialise variables for isoparametric mapping
        let { ph, phic, phie } = basisFunQuad2D(gp[j], gp[k]);
        x = y = x1 = x2 = y1 = y2 = dett = 0;

        // Isoparametric mapping
        for (let n = 0; n < 9; n++) {
          x += axpt[ngl[n]] * ph[n];
          y += aypt[ngl[n]] * ph[n];
          x1 += axpt[ngl[n]] * phic[n];
          x2 += axpt[ngl[n]] * phie[n];
          y1 += aypt[ngl[n]] * phic[n];
          y2 += aypt[ngl[n]] * phie[n];
          dett = x1 * y2 - x2 * y1;
        }

        // Compute x-derivative and y-derivative of basis functions
        for (let n = 0; n < 9; n++) {
          phx[n] = (y2 * phic[n] - y1 * phie[n]) / dett;  // The x-derivative of the n basis function
          phy[n] = (x1 * phie[n] - x2 * phic[n]) / dett;  // The y-derivative of the n basis function
        }

        // Computation of Galerkin's residuals and Jacobian matrix
        for (let m = 0; m < 9; m++) {
          let m1 = ngl[m];
          res[m1] += wgp[j] * wgp[k] * dett * ph[m];

          for (let n = 0; n < 9; n++) {
            let n1 = ngl[n];
            jac[m1][n1] += -wgp[j] * wgp[k] * dett * (phx[m] * phx[n] + phy[m] * phy[n]);
          }
        }
      }
    }

    // Impose Robin boundary conditions
    /*
    Representation of the nodes in the case of quadratic rectangular elements

      2__5__8
      |     |
      1  4  7
      |__ __|
      0  3  6

    */
   
    if (RobCondFlagTop[i] == 1 || RobCondFlagBottom[i] == 1 || RobCondFlagLeft[i] == 1 || RobCondFlagRight[i] == 1) {
      for (let l = 0; l < 3; l++) {
        let gp1, gp2, firstNode, finalNode, nodeIncr;
        // Set gp1 and gp2 based on boundary conditions
        if (RobCondFlagTop[i] == 1) {
          // Set gp1 and gp2 for elements at the top side of the domain (nodes 2, 5, 8)
          gp1 = gp[l];
          gp2 = 1;
          firstNode = 2;
          finalNode = 9; // final node minus one
          nodeIncr = 3;
        } else if (RobCondFlagBottom[i] == 1) {
          // Set gp1 and gp2 for elements at the bottom side of the domain (nodes 0, 3, 6)
          gp1 = gp[l];
          gp2 = 0;
          firstNode = 0;
          finalNode = 7;
          nodeIncr = 3;
        } else if (RobCondFlagLeft[i] == 1) {
          // Set gp1 and gp2 for elements at the left side of the domain (nodes 0, 1, 2)
          gp1 = 0;
          gp2 = gp[l];
          firstNode = 0;
          finalNode = 3;
          nodeIncr = 1;
        } else if (RobCondFlagRight[i] == 1) {
          // Set gp1 and gp2 for elements at the right side of the domain (nodes 6, 7, 8)
          gp1 = 1;
          gp2 = gp[l];
          firstNode = 6;
          finalNode = 9;
          nodeIncr = 1;
        }
        // Evaluate the basis functions and their derivatives at the Gauss point
        let { ph, phic, phie } = basisFunQuad2D(gp1, gp2);
        x = x1 = 0;
        for (let k = 0; k < 9; k++) {
          x += axpt[ngl[k]] * ph[k]; // Interpolate the x-coordinate at the Gauss point
          x1 += axpt[ngl[k]] * phic[k]; // Interpolate the ksi-derivative of x at the Gauss point
        }
        for (let m = firstNode; m < finalNode; m += nodeIncr) {
          let m1 = ngl[m];
          res[m1] += -wgp[l] * x1 * ph[m] * robinHeatTranfCoeff * robinExtTemp; // Add the Robin boundary term to the residual vector
          for (let n = firstNode; n < finalNode; n += nodeIncr) {
            let n1 = ngl[n];
            jac[m1][n1] += -wgp[l] * x1 * ph[m] * ph[n] * robinHeatTranfCoeff; // Add the Robin boundary term to the Jacobian matrix
          }
        }
      }
    }
  }

  // Check for elements to impose Dirichlet boundary conditions
  for (let i = 0; i < np - nny + 1; i += nny) { // Define dirCondFlag and dirCondVal for nodes on y=yfirst (bottom side of the domain)
    if (bottomBound[0] == "dirichlet") {
      dirCondFlag[i] = 1;
      dirCondVal[i] = bottomBound[1];
    }
  }
  for (let i = 0; i < nny; i++) { // Define dirCondFlag and dirCondVal for nodes on x=xfirst (left side of the domain)
    if (leftBound[0] == "dirichlet") {
      dirCondFlag[i] = 1;
      dirCondVal[i] = leftBound[1];
    }
  }
  for (let i = nny - 1; i < np; i += nny) { // Define dirCondFlag and dirCondVal for nodes on y=ylast (top side of the domain)
    if (topBound[0] == "dirichlet") {
      dirCondFlag[i] = 1;
      dirCondVal[i] = topBound[1];
    }
  } 
  for (let i = np - nny; i < np; i++) { // Define dirCondFlag and dirCondVal for nodes on x=xlast (right side of the domain)
    if (rightBound[0] == "dirichlet") {
      dirCondFlag[i] = 1;
      dirCondVal[i] = rightBound[1];
    }
  }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np; i++) {
    if (dirCondFlag[i] == 1) {
      res[i] = dirCondVal[i]; // Set the residual vector to the Dirichlet value
      for (let j = 0; j < np; j++) {
        jac[i][j] = 0; // Set the Jacobian matrix to zero
        jac[i][i] = 1; // Set the diagonal entry to one
      }
    }
  }

  return { jac, res, nnx, nny, axpt, aypt };
}