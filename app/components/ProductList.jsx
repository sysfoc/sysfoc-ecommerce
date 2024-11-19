"use client"
import Link from 'next/link'
import React from 'react'

const ProductList = () => {
    const cardContent = [
        {
            title: 'Seasonal Co-ord sets',
            description: 'A list of products',
            image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
            title: 'Formals',
            description: 'luxury',
            image: 'https://images.pexels.com/photos/1204678/pexels-photo-1204678.png?auto=compress&cs=tinysrgb&w=600',
        },
        {
            title: 'Serena Bridals',
            description: 'luxury',
            image: 'https://images.pexels.com/photos/6371822/pexels-photo-6371822.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            title: 'lawn',
            description: 'luxury',
            image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            title: 'Pret',
            description: 'luxury',
            image: 'https://images.pexels.com/photos/18892681/pexels-photo-18892681/free-photo-of-blonde-model-in-shadow.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
    ]
  return (
    <section className='mx-4 sm:mx-12'>
        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
            {
                cardContent.map((content,index)=>(
                    <div key={index} style={{background: `url('${content.image}')`, backgroundPosition:"center", backgroundRepeat:'no-repeat'}} className="bg-cover relative w-full h-[450px] object-cover">
                    <div className='absolute bottom-5 p-5'>
                        <span className='text-lg text-white uppercase'>{content.description}</span>
                        <h3 className='mt-3 mb-5 text-3xl text-white font-bold uppercase'>{content.title}</h3>
                        <div>
                            <Link href="/" className='text-black px-5 py-3 border border-white uppercase bg-white'>View Designs</Link>
                        </div>
                    </div>
                </div>
                ))
            }
        </div>
    </section>
  )
}

export default ProductList