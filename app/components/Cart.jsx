import { Button, Dropdown, DropdownItem } from "flowbite-react";
import Image from "next/image";
import React from "react";
import { FiShoppingCart } from "react-icons/fi";

const Cart = () => {
  return (
    <Dropdown
      arrowIcon={true}
      inline={true}
      label={
        <span className="flex items-center space-x-2">
          <FiShoppingCart className="dark:text-gray-300" />
        </span>
      }
    >
      <div className="p-4 w-100">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Shopping Cart
        </h3>
        <DropdownItem>
          <div className="flex items-center justify-between space-x-4">
            <Image
              src="https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Product 1"
              width={50}
              height={50}
              className="w-[50px] h-[50px] rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Product Name 1</p>
              <p className="text-xs text-gray-500 dark:text-white">
                Qty: 1 x $25.00
              </p>
            </div>
            <p className="text-sm font-semibold">$25.00</p>
          </div>
        </DropdownItem>

        <DropdownItem>
          <div className="flex items-center justify-between space-x-4">
            <Image
              src="https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Product 2"
              width={50}
              height={50}
              className="w-[50px] h-[50px] rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Product Name 2</p>
              <p className="text-xs text-gray-500 dark:text-white">
                Qty: 2 x $15.00
              </p>
            </div>
            <p className="text-sm font-semibold">$30.00</p>
          </div>
        </DropdownItem>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between text-sm font-medium">
            <span>Subtotal</span>
            <span>$55.00</span>
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full" color="dark">
            Checkout
          </Button>
        </div>
      </div>
    </Dropdown>
  );
};

export default Cart;
