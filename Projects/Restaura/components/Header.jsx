'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';

import Nav from './Nav';
import NavMobile from './NavMobile';
import { Button } from './ui/button';

const Header = () => {
   const [active, setActive] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         // detect scroll
         setActive(window.scrollY > 100);
      };

      // add event listeners
      window.addEventListener('scroll', handleScroll);

      // clear event listeners
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   return (
      <header
         className={`${
            active ? 'bg-black-heavy py-4' : 'bg-none py-8'
         } fixed top-0 w-full z-50 left-0 ring-0 transition-all duration-200`}
      >
         <div className='container mx-auto'>
            {/* logo, nav, btn */}
            <div className='flex items-center justify-between'>
               {/* logo */}
               <Link href='/'>
                  <Image
                     src='/logo.svg'
                     width={75}
                     height={30}
                     alt='site logo'
                  />
               </Link>
               {/* nav */}
               <Nav
                  containerStyles='hidden xl:flex gap-x-12 text-white'
                  linkStyles='capitialize'
               />
               {/* btn */}
               <ScrollLink to='reservation' smooth={true}>
                  <Button variant='orange' size='sm'>
                     Book a table
                  </Button>
               </ScrollLink>
               {/* mobile nav */}
               <NavMobile
                  containerStyles='xl:hidden'
                  iconStyles='text-3xl'
                  linkStyles='uppercase'
               />
            </div>
         </div>
      </header>
   );
};

export default Header;
