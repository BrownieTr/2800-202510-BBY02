import React from "react";
import Navbar from "../components/layout/navbar";
import MessageCard from "../components/ui/messageCard";

export default function messages(){
    return(
        <>
            <Navbar iconLeft={"←"} iconRight={"+"} header="username"/>
            <MessageCard profilePic={"https://www.dummyimage.com/50x50/000/fff"}/>
        </>
    );
}