//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

import { createCoord2D, nodNum2D } from './createCoord.js';
import { basisFunQuad2D } from './basisFun.js';

export function createLaplaceMat2D(nex, ney, xlast, ylast) {

  // Generate x-y coordinates using createCoord2D function
  let { axpt, aypt, nnx, nny } = createCoord2D(nex, ney, xlast, ylast);

  // Generate nop array
  let nop = nodNum2D(nex, ney, nnx, nny);

  // Initialize variables for matrix assembly
  const ne = nex * ney; // Total number of elements
  const np = nnx * nny; // Total number of nodes
  let ntop = []; // Neumann boundary condition flag (elements at the top side of the domain)
  let nbottom = []; // Neumann boundary condition flag (elements at the bottom side of the domain)
  let nleft = []; // Neumann boundary condition flag (elements at the left side of the domain)
  let nright = []; // Neumann boundary condition flag (elements at the right side of the domain)
  let ncod = []; // Dirichlet boundary condition flag
  let bc = [];
  let ngl = [];
  let gp = [];
  let wgp = [];
  let phx = []; // The x-derivative of the basis function
  let phy = []; // The y-derivative of the basis function
  let res = [];
  let jac = [];
  let x;
  let y;
  let x1;
  let x2;
  let y1;
  let y2;
  let dett; // The jacobian of the isoparametric mapping
  let m1;
  let n1;

  // Initialize jac and res arrays
  for (let i = 0; i < np; i++) {
    res[i] = 0;
    jac.push([]);
    for (let j = 0; j < np; j++) {
      jac[i][j] = 0;
    }
  }

  // Neumann boundary conditions
  for (let i = 0; i < ne; i++) {
    ntop[i] = 0;
    nbottom[i] = 0;
    nleft[i] = 0;
    nright[i] = 0;
  }

  // Define ntop for elements along y=yfirst
  for (let i = 0; i < ne - ney; i += ney) {
  //  ntop[i] = 1;
  //  nbottom[i] = 1;
  //  nleft[i] = 1;
  //  nright[i] = 1;
  } 

  // Define ntop for elements along x=xfirst
  for (let i = 0; i < ney; i++) {
  //  ntop[i] = 1;
  //  nbottom[i] = 1;
  //  nleft[i] = 1;
  //  nright[i] = 1;
  } 

  // Define ntop for elements along y=ylast
  for (let i = ney - 1; i < ne; i += ney) {
    ntop[i] = 1;
  //  nbottom[i] = 1;
  //  nleft[i] = 1;
  //  nright[i] = 1;
  } 
  
  // Define ntop for elements along x=xlast
  for (let i = ne - ney; i < ne; i++) {
  //  ntop[i] = 1;
  //  nbottom[i] = 1;
  //  nleft[i] = 1;
  //  nright[i] = 1;
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
        x = 0;
        y = 0;
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;

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
          m1 = ngl[m];
          res[m1] += wgp[j] * wgp[k] * dett * ph[m];

          for (let n = 0; n < 9; n++) {
            n1 = ngl[n];
            jac[m1][n1] += -wgp[j] * wgp[k] * dett * (phx[m] * phx[n] + phy[m] * phy[n]);
          }
        }
      }
    }

    // Check for elements to impose Neumann boundary conditions
    if (ntop[i] == 1 || nbottom[i] == 1 || nleft[i] == 1 || nright[i] == 1) {
      for (let n = 0; n < 3; n++) {
        let gp1, gp2, firstNode, finalNode, nodeIncr;
        // Set gp1 and gp2 based on boundary conditions
        if (ntop[i] == 1) {
          // Set gp1 and gp2 for elements at the top side of the domain
          gp1 = gp[n];
          gp2 = 1;
          firstNode = 2;
          finalNode = 9; // final node minus one
          nodeIncr = 3;
        } else if (nbottom[i] == 1) {
          // Set gp1 and gp2 for elements at the bottom side of the dom  ain
          gp1 = gp[n];
          gp2 = 0;
          firstNode = 0;
          finalNode = 7;
          nodeIncr = 3;
        } else if (nleft[i] == 1) {
          // Set gp1 and gp2 for elements at the left side of the domain
          gp1 = 0;
          gp2 = gp[n];
          firstNode = 0;
          finalNode = 3;
          nodeIncr = 1;
        } else if (nright[i] == 1) {
          // Set gp1 and gp2 for elements at the right side of the domain
          gp1 = 1;
          gp2 = gp[n];
          firstNode = 6;
          finalNode = 9;
          nodeIncr = 1;
        }
        let { ph, phic, phie } = basisFunQuad2D(gp1, gp2);
        x = 0;
        x1 = 0;
        for (let k = 0; k < 9; k++) {
          x += axpt[ngl[k]] * ph[k];
          x1 += axpt[ngl[k]] * phic[k];
        }
        for (let m1 = firstNode; m1 < finalNode; m1 += nodeIncr) {
          res[m1] += -wgp[n] * x1 * ph[m1];
        }
      }
    }
  }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np; i++) {
    ncod[i] = 0;
    bc[i] = 0;
 }

  // Define ncod and bc for nodes on y=yfirst
  for (let i = 0; i < np - nny + 1; i += nny) {
    ncod[i] = 1;
    bc[i] = 1;
  }

  // Define ncod and bc for nodes on x=xfirst
  for (let i = 0; i < nny; i++) {
    ncod[i] = 1;
    bc[i] = 1;
  }

  // Define ncod and bc for nodes on y=ylast
  //for (let i = nny - 1; i < np; i += nny) {
  //  ncod[i] = 1;
  //  bc[i] = 1;
  //} 

  // Define ncod and bc for nodes on x=xlast
  for (let i = np - nny; i < np; i++) {
    ncod[i] = 1;
    bc[i] = 1;
  }

  // Impose Dirichlet boundary conditions
  for (let i = 0; i < np; i++) {
    if (ncod[i] == 1) {
      res[i] = bc[i];
      for (let j = 0; j < np; j++) {
        jac[i][j] = 0;
        jac[i][i] = 1;
      }
    }
  }

  return { jac, res, nnx, nny, axpt, aypt };
}
