"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserType } from "@/lib/utils";
import { useRouter } from "next/navigation";


const HeroBanner = () => (
  <section className="w-full h-1/2 bg-white text-black text-center mt-28 py-10">
    <div className="w-full text-center text-4xl font-extrabold py-4">
      Welcome to the Exam Analysis Tool
    </div>
    <div className="text-xl">
      What is your role?
    </div>
  </section>
);


const Page = () => {

  const router = useRouter();

  const setUserType = (userType: UserType) => {
    localStorage.setItem("user-role", userType);
    router.push("/analyze");
  }
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //prevent hydration error
  if (!isMounted) {
    return null;
  }
  return (
    <>
      <HeroBanner />
      <div className="w-full h-24 flex flex-col items-center text-center space-y-2">
        <Button onClick={e => setUserType("exam-officer")}>
          <Link href="/analyze">I'm an Exam Officer</Link>
        </Button>
        <Button onClick={e => setUserType("module-convenor")}>
          <Link href="/analyze">I'm a Module Convenor</Link>
        </Button>
      </div>
    </>
  )
}
export default Page;