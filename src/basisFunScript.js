//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

/**
 * Return the linear basis functions for one-dimensional elements
 * @param {*} x 
 */
export function basisFunLin1D(x) {

  let ph = [];
  let phd = [];

  // Evaluate basis function
  ph[0]= 1 - x;
  ph[1]= x;

  // Evaluate the derivative of basis function
  phd[0]= -1;
  phd[1]= 1;

  // Return the evaluated basis function and derivatives
  return { ph, phd };
}

/**
 * Return the quadratic basis functions for rectangular elements
 * @param {*} x - First coordinate (ksi) in natural coordinates
 * @param {*} y - Second coordinate (eta) in natural coordinates
 * @returns
 */
export function basisFunQuad2D(x, y) {

  let ph = [];
  let phic = [];
  let phie = [];

  function l1(c){
    return 2 * c ** 2 - 3 * c + 1;
  }
  function l2(c){
    return - 4 * c ** 2 + 4 * c;
  }
  function l3(c){
    return 2 * c ** 2 - c;
  }
  function dl1(c){
    return 4 * c - 3;
  }
  function dl2(c){
    return - 8 * c + 4;
  }
  function dl3(c){
    return 4 * c - 1;
  }
  
  // Evaluate basis functions
  ph[0] = l1(x) * l1(y);
  ph[1] = l1(x) * l2(y);
  ph[2] = l1(x) * l3(y);
  ph[3] = l2(x) * l1(y);
  ph[4] = l2(x) * l2(y);
  ph[5] = l2(x) * l3(y);
  ph[6] = l3(x) * l1(y);
  ph[7] = l3(x) * l2(y);
  ph[8] = l3(x) * l3(y);
  
  // Evaluate x-derivative of basis functions
  phic[0] = l1(y) * dl1(x);
  phic[1] = l2(y) * dl1(x);
  phic[2] = l3(y) * dl1(x);
  phic[3] = l1(y) * dl2(x);
  phic[4] = l2(y) * dl2(x);
  phic[5] = l3(y) * dl2(x);
  phic[6] = l1(y) * dl3(x);
  phic[7] = l2(y) * dl3(x);
  phic[8] = l3(y) * dl3(x);
  
  // Evaluate y-derivative of basis functions
  phie[0] = l1(x) * dl1(y);
  phie[1] = l1(x) * dl2(y);
  phie[2] = l1(x) * dl3(y);
  phie[3] = l2(x) * dl1(y);
  phie[4] = l2(x) * dl2(y);
  phie[5] = l2(x) * dl3(y);
  phie[6] = l3(x) * dl1(y);
  phie[7] = l3(x) * dl2(y);
  phie[8] = l3(x) * dl3(y);
  
  // Return the evaluated basis functions and derivatives
  return { ph, phic, phie };
}