/**
 * Middle header section
 * author: fgondwe@stanford.edu
 * date: 12/15/17
 */

 import React, {Component} from 'react';
 import MenuItems from './menuItems';

 class MiddleHeader extends Component{
   render(){
     return (
          <div>
              <MenuItems />
          </div>
     );

   }
 }

 export default MiddleHeader;
