"use client";
import { useEffect, useState } from "react";
import { UserType } from "@/lib/utils";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ComboboxDemo, keyType } from "./ui/combobox";

export default function Topnav() {
  const ROUTES: keyType[] = [
    {
      value: "/analyze",
      label: "Analyze a module",
    },
    {
      value: "/seasonal",
      label: "Generate a seasonal report",
    },
    {
      value: "/analyze-seasonal",
      label: "Analyze a seasonal report",
    },
    {
      value: "/year-over-year",
      label: "Year over year analysis",
    },
  ];
  // to get the current path
  const path = usePathname();

  // use the router to push the route
  const router = useRouter();

  // get user type from local storage
  const [userType, setUserType] = useState<UserType>("unknown");

  useEffect(() => {
    const userTypes = localStorage.getItem("user-role") as UserType;

    // redirect if user is not detected as any user type
    if (userTypes === "unknown") {
      router.replace("/");
    }
  }, [userType]);

  useEffect(() => {
    const userType = localStorage.getItem("user-role") as UserType;

    setUserType(userType);
    // redirect if user is not detected as any user type
    if (userType === "unknown") {
      router.replace("/");
    }
  }, []);

  const exitSession = () => {
    localStorage.setItem("user-role", "unknown");
    console.log("redirecting...");
    router.replace("/");
  };
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //prevent hydration error
  if (!isMounted) {
    return null;
  }
  const navigateToPath = (value: string) => router.push(value);
  return (
    <div className="w-11/12 flex flex-row justify-between px-4 py-2 mx-auto">
      <img src="./logo.png" alt="logo" className="h-12 mt-2" />

      <ComboboxDemo
        keyName="function"
        value={path}
        filterKeyList={
          userType === "exam-officer" ? ROUTES : [ROUTES[0], ROUTES[3]]
        }
        setValue={navigateToPath}
      />
      <Button variant="destructive" onClick={(_) => exitSession()}>
        Exit Session
      </Button>
    </div>
  );
}
