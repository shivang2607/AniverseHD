'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { BsDiscord } from "react-icons/bs";
import { FaLinkedin } from 'react-icons/fa';

const devData = [
  {
    name: "Shivang Khandelwal",
    desc: "Hello My name is Shivang Khandelwal and I developed the Recommendation System, Streaming and Anime details Logic and other related functionality",
    imgUrl: "/ShivangProfile.jpg",
    discord: "",
    linkedIn: "",
  },
  {
    name: "Abhay Lodhi",
    desc: "Hi, My name is Abhay Lodhi and I handled the Anime store, Watchlists, Profile authentication and User Data and Logic for sharing User Watch Lists.",
    imgUrl: "/abhayProfile.jpg",
    discord: "",
    linkedIn: "",
  },
];

const devId = "gdid";

export default function Page({ params }) {
  const router = useRouter();

  // Function to sum digits of a number
  function sumOfDigits(num) {
    return num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  // Function to generate unique number
  function generateUniqueNumber() {
    const today = new Date();

    const day = today.getDate();
    const sumOfDay = sumOfDigits(day);

    const month = today.getMonth() + 1; // getMonth() is 0-based, so add 1
    const sumOfMonth = sumOfDigits(month);

    const year = today.getFullYear();
    const lastTwoDigits = year % 100;
    const sumOfYear = sumOfDigits(lastTwoDigits);

    return `${sumOfDay}${sumOfMonth}${sumOfYear}`;
  }

  // useEffect to handle redirects based on params.id
  useEffect(() => {
    const paramId = params?.id?.toLowerCase(); // Convert id to lowercase
    const generatedId = `uid-${generateUniqueNumber()}`.toLowerCase(); // Generate unique ID and convert to lowercase

    // Redirect if the paramId is neither the generated ID nor devId
    if (paramId && paramId !== generatedId && paramId !== devId) {
      router.replace("/not-found");
    }
  }, [params, router]);

  return (
    <>
      {/* If paramId matches the generated unique number, display developer info */}
      {params?.id?.toLowerCase() === `uid-${generateUniqueNumber()}` ? (
        <div className='w-full min-h-screen my-8 flex flex-col gap-16 pt-24'>
          <h1 className='text-3xl font-bold tracking-wide mx-auto flex'>About Developers</h1>
          <div className='mx-auto md:w-5/6 w-full flex md:flex-row flex-col gap-12 p-4'>
            {devData.map(dev => (
              <div
                key={dev.name}
                className='md:w-1/2 w-5/6 mx-auto min-h-96 flex flex-col md:flex-row rounded-xl overflow-hidden bg-cbg-300/40'
              >
                <div className="profile relative md:w-1/2 h-80 md:h-full">
                  <Image src={dev.imgUrl} alt={dev.name} fill className='object-cover object-center' />
                </div>
                <div className="content flex md:w-1/2 p-5 flex-col gap-3">
                  <h2 className='text-xl font-semibold mx-auto text-primary-100 text-pretty self-center flex'>{dev.name}</h2>
                  <div className="desc flex text-justify text-sm">{dev.desc}</div>

                  <div className="profileLinks w-full mt-8 justify-center items-center flex gap-12">
                    <Link href={dev.discord}>
                      <BsDiscord className='text-primary-400 text-3xl' />
                    </Link>

                    <Link href={dev.linkedIn}>
                      <FaLinkedin className='text-primary-400 text-3xl' />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='pt-24 min-h-screen mx-auto flex'>
          {console.log(params?.id)}
          {/* If paramId is devId, show the link */}
          {params?.id?.toLowerCase() === devId &&  (
            <Link href={`/about-dev/uid-${generateUniqueNumber()}`} className='text-2xl flex mx-auto'>
              Head to Developers Page from here
            </Link>
          )}
        </div>
      )}
    </>
  );
}
