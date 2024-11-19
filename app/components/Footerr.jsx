import { Footer, FooterCopyright, FooterIcon, FooterLink, FooterLinkGroup, FooterTitle, TextInput } from 'flowbite-react';
import React from 'react'
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
const Footerr = () => {
  return (
    <Footer className='mt-10'>
      <div className="w-full">
        <div className="grid w-full grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4">
          <div>
            <FooterTitle title="Main Menu" />
            <FooterLinkGroup col>
              <FooterLink href="#">Home</FooterLink>
              <FooterLink href="#">Sale</FooterLink>
              <FooterLink href="#">Electronics</FooterLink>
              <FooterLink href="#">Furniture</FooterLink>
            </FooterLinkGroup>
          </div>
          <div>
            <FooterTitle title="About" />
            <FooterLinkGroup col>
              <FooterLink href="#">Discord Server</FooterLink>
              <FooterLink href="#">Twitter</FooterLink>
              <FooterLink href="#">Facebook</FooterLink>
              <FooterLink href="#">Contact Us</FooterLink>
            </FooterLinkGroup>
          </div>
          <div>
            <FooterTitle title="legal" />
            <FooterLinkGroup col>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Licensing</FooterLink>
              <FooterLink href="#">Terms &amp; Conditions</FooterLink>
            </FooterLinkGroup>
          </div>
          <div>
            <FooterTitle title="Newsletter" />
            <div className='flex flex-col gap-3'>
              <p className='text-gray-600 dark:text-gray-300'>Subscribe to receive updates, access to exclusive deals, and more.</p>
              <TextInput type='email' placeholder='Type your email address'/>
            </div>
            <div className='mt-3'>
              <button className='text-white bg-black px-5 py-2'>Subscribe</button>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 px-4 py-6 sm:flex sm:items-center sm:justify-between">
          <FooterCopyright href="#" by="SYSFOC e-commerce app" year={2024} />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <FooterIcon href="#" icon={BsFacebook} />
            <FooterIcon href="#" icon={BsInstagram} />
            <FooterIcon href="#" icon={BsTwitter} />
            <FooterIcon href="#" icon={BsGithub} />
            <FooterIcon href="#" icon={BsDribbble} />
          </div>
        </div>
      </div>
    </Footer>
  )
}

export default Footerr