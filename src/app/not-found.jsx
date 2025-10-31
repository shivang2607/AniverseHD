import Image from 'next/image'
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='py-16 flex flex-col gap-4 justify-center items-center h-fit w-full '>
      <img src='/nfi.png' alt="Page not found" className=' rounded-md md:w-[75%] w-[90%] my-4 overflow-hidden opacity-85'/>
      <h1 className='relative z-10  text-4xl text-gray-200  font-semibold  '>Page not found :(</h1>
      <Link href="/" className="redirect flex flex-col gap-2 my-8">
        <div className='relative h-44 w-80 flex justify-center items-center mx-auto'>
        <Image src="/redirect character.png" alt="<" fill className='flex w-full'/>
        </div>
        <div className='font-semibold flex mx-auto items-center justify-center'>Go Back to Home Page</div>
      </Link>
      
    </div>
  )
}