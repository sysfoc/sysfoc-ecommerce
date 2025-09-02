"use client"

import { useState, useEffect } from "react"
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  TextInput,
} from "flowbite-react"
import { FaPhone } from "react-icons/fa6"
import Link from "next/link"
import Image from "next/image"
import Darkmode from "./Darkmode"
import Cart from "./Cart"
import { auth } from "../../lib/firebaseClient"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

const Header = () => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch user profile from API
        try {
          const token = await firebaseUser.getIdToken()
          const response = await fetch("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const profile = await response.json()
            setUserProfile(profile)
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      router.push("/sign-in")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between w-full bg-gray-100 dark:bg-gray-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <FaPhone className="text-gray-600 dark:text-gray-300" />{" "}
          <span className="text-gray-600 dark:text-gray-300">(555) 555-1234</span>
        </div>
        <div className="text-center hidden md:block">
          <span className="dark:text-gray-300">
            Get 50% off on Member Exclusive Month |{" "}
            <Link href="#" className="underline">
              Shop Now
            </Link>
          </span>
        </div>
        <div>
          <Darkmode />
        </div>
      </div>
      <Navbar className="shadow-md w-full">
        <div className="flex items-center justify-between w-full gap-5">
          <div>
            <NavbarBrand href="/">
              <Image
                src="https://flowbite.com/docs/images/logo.svg"
                width={30}
                height={30}
                className="mr-3 h-6 sm:h-9"
                alt="Flowbite React Logo"
              />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Sysfoc Ecom</span>
            </NavbarBrand>
          </div>
          <div className="w-1/2 hidden lg:block">
            <TextInput type="search" className="w-full" placeholder="What can we help you to find today?" />
          </div>
          <div className="hidden md:flex gap-5 items-center">
            <div>
              <Cart />
            </div>
            <div>
              {user ? (
                <Dropdown
                  arrowIcon={true}
                  inline
                  label={
                    <span className="flex items-center space-x-2">
                      <Avatar
                        size="sm"
                        rounded
                        img={
                          user.photoURL ||
                          "https://images.pexels.com/photos/9604304/pexels-photo-9604304.jpeg?auto=compress&cs=tinysrgb&w=600"
                        }
                      />
                    </span>
                  }
                >
                  <div className="w-[150px]">
                    <DropdownHeader>
                      <span className="block text-sm">{userProfile?.name || user.displayName || "User"}</span>
                      <span className="block truncate text-sm font-semibold">{user.email}</span>
                    </DropdownHeader>
                    <DropdownItem onClick={() => router.push("/account")}>Profile</DropdownItem>
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Orders</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleSignOut}>Sign out</DropdownItem>
                  </div>
                </Dropdown>
              ) : (
                <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <NavbarToggle />
        </div>
        <NavbarCollapse className="md:hidden">
          <NavbarLink href="#" active color="dark">
            Home
          </NavbarLink>
          <NavbarLink href="#">About</NavbarLink>
          <NavbarLink href="#">Services</NavbarLink>
          <NavbarLink href="#">Pricing</NavbarLink>
          <NavbarLink href="#">Contact</NavbarLink>
        </NavbarCollapse>
        <div className="hidden md:flex w-full items-center gap-x-5 border-t border-gray-300 mt-3 pt-2">
          <Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-500">
            Home
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 ml-4 dark:text-gray-500">
            Sale
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 ml-4 dark:text-gray-500 ">
            Electronics
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 ml-4 dark:text-gray-500">
            Furniture
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 ml-4 dark:text-gray-500">
            Clothes
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 ml-4 dark:text-gray-500">
            New Arrival
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 ml-4 dark:text-gray-500">
            Best Sellers
          </Link>
        </div>
      </Navbar>
    </>
  )
}

export default Header
