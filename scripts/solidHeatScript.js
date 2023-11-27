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

// Generate the matrix and the residual vector for the Finite Element Method in two dimensions
export function createSolidHeatMat2D(nex, ney, xlast, ylast, boundaryConditions) {

  // Generate x-y coordinates using genStructMesh2D function
  let { axpt, aypt, nnx, nny } = genStructMesh2D(nex, ney, xlast, ylast);

  // Generate nop array
  let nop = nodNumStruct2D(nex, ney, nnx, nny);

  // Initialize variables for matrix assembly
  const ne = nex * ney; // Total number of elements
  const np = nnx * nny; // Total number of nodes
  let ntop = new Array(ne).fill(0); // Neumann boundary condition flag (elements at the top side of the domain)
  let nbottom = new Array(ne).fill(0); // Neumann boundary condition flag (elements at the bottom side of the domain)
  let nleft = new Array(ne).fill(0); // Neumann boundary condition flag (elements at the left side of the domain)
  let nright = new Array(ne).fill(0); // Neumann boundary condition flag (elements at the right side of the domain)
  let ncod = new Array(np).fill(0); // Dirichlet boundary condition flag
  let bc = new Array(np).fill(0); // Dirichlet boundary condition value
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
    neumannTop,
    neumannBottom,
    neumannLeft,
    neumannRight,
    robinTop,
    robinBottom,
    robinLeft,
    robinRight,
    dirichletTop,
    dirichletBottom,
    dirichletLeft,
    dirichletRight,
    dirichletValueTop,
    dirichletValueBottom,
    dirichletValueLeft,
    dirichletValueRight,
  } = boundaryConditions;

  // Impose Neumann boundary conditions
  for (let i = 0; i < ne - ney; i += ney) { // Define ntop for elements along y=yfirst (bottom side of the domain)
     if (neumannBottom) {
       nbottom[i] = 1;
	 }
  }
  for (let i = 0; i < ney; i++) { // Define ntop for elements along x=xfirst (left side of the domain)
     if (neumannLeft) {
       nleft[i] = 1;
	 }
  }
  for (let i = ney - 1; i < ne; i += ney) { // Define ntop for elements along y=ylast (top side of the domain)
     if (neumannTop) {
       ntop[i] = 1;
	 }
  }
  for (let i = ne - ney; i < ne; i++) { // Define ntop for elements along x=xlast (right side of the domain)
     if (neumannRight) {
       nright[i] = 1;
	 }
  }

  // // Impose Neumann boundary conditions (alternative -easier to read- method)
  // for (let i = 0; i < ne; i++) {
  //   if (aypt[nop[i][8]] == ylast) { // Check if element is at the top side of the domain (y = ylast)
  //     ntop[i] = +1;
  //   }
  //   if (aypt[nop[i][0]] == yfirst) { // Check if element is at the bottom side of the domain (y = yfirst)
  //     nbottom[i] = +1;
  //   }
  //   if (axpt[nop[i][0]] == xfirst) { // Check if element is at the left side of the domain (x  = xfirst)
  //     nleft[i] = +1;
  //   }
  //   if (axpt[nop[i][6]] == xlast) { // Check if element is at the right side of the domain (x =xlast)
  //     nright[i] = +1;
  //   }
  //  }

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

    // Check for elements to impose Neumann boundary conditions
    /*
    Representation of the nodes in the case of quadratic rectangular elements
    
      2__5__8
      |     |
      1  4  7
      |__ __|
      0  3  6

    */
    if (ntop[i] == 1 || nbottom[i] == 1 || nleft[i] == 1 || nright[i] == 1) {
      for (let n = 0; n < 3; n++) {
        let gp1, gp2, firstNode, finalNode, nodeIncr;
        // Set gp1 and gp2 based on boundary conditions
        if (ntop[i] == 1) {
          // Set gp1 and gp2 for elements at the top side of the domain (nodes 2, 5, 8)
          gp1 = gp[n];
          gp2 = 1;
          firstNode = 2;
          finalNode = 9; // final node minus one
          nodeIncr = 3;
        } else if (nbottom[i] == 1) {
          // Set gp1 and gp2 for elements at the bottom side of the domain (nodes 0, 3, 6)
          gp1 = gp[n];
          gp2 = 0;
          firstNode = 0;
          finalNode = 7;
          nodeIncr = 3;
        } else if (nleft[i] == 1) {
          // Set gp1 and gp2 for elements at the left side of the domain (nodes 0, 1, 2)
          gp1 = 0;
          gp2 = gp[n];
          firstNode = 0;
          finalNode = 3;
          nodeIncr = 1;
        } else if (nright[i] == 1) {
          // Set gp1 and gp2 for elements at the right side of the domain (nodes 6, 7, 8)
          gp1 = 1;
          gp2 = gp[n];
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
        for (let m1 = firstNode; m1 < finalNode; m1 += nodeIncr) {
          res[m1] += -wgp[n] * x1 * ph[m1]; // Add the Neumann boundary term to the residual vector
        }
      }
    }
  }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np - nny + 1; i += nny) { // Define ncod and bc for nodes on y=yfirst (bottom side of the domain)
    if (dirichletBottom) {
      ncod[i] = 1;
      bc[i] = dirichletValueBottom;
    }
  }
  for (let i = 0; i < nny; i++) { // Define ncod and bc for nodes on x=xfirst (left side of the domain)
    if (dirichletLeft) {
      ncod[i] = 1;
      bc[i] = dirichletValueLeft;
    }
  }
  for (let i = nny - 1; i < np; i += nny) { // Define ncod and bc for nodes on y=ylast (top side of the domain)
    if (dirichletTop) {
      ncod[i] = 1;
      bc[i] = dirichletValueTop;
    }
  } 
  for (let i = np - nny; i < np; i++) { // Define ncod and bc for nodes on x=xlast (right side of the domain)
    if (dirichletRight) {
      ncod[i] = 1;
      bc[i] = dirichletValueRight;
    }
  }

  // // Impose Dirichlet boundary conditions (alternative -easier to read- method)
  // for (let i = 0; i < np; i++) {
  //   if (aypt[i] == yfirst) { // Check if node is at the bottom side of the domain
  //     ncod[i] = 1;
  //     bc[i] = 1; // Assign a value or a function to the node's unknown field
  //   }
  //   if (aypt[i] == ylast) { // Check if node is at the top side of the domain
  //     ncod[i] = 1;
  //     bc[i] = 1; // Assign a value or a function to the node's unknown field
  //   }
  //   if (axpt[i] == xfirst) { // Check if node is at the left side of the domain
  //     ncod[i] = 1;
  //     bc[i] = 1; // Assign a value or a function to the node's unknown field
  //   }
  //   if (axpt[i] == xlast) { // Check if node is at the right side of the domain
  //     ncod[i] = 1;
  //     bc[i] = 1; // Assign a value or a function to the node's unknown field
  //   }
  // }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np; i++) {
    if (ncod[i] == 1) {
      res[i] = bc[i]; // Set the residual vector to the Dirichlet value
      for (let j = 0; j < np; j++) {
        jac[i][j] = 0; // Set the Jacobian matrix to zero
        jac[i][i] = 1; // Set the diagonal entry to one
      }
    }
  }

  return { jac, res, nnx, nny, axpt, aypt };
}