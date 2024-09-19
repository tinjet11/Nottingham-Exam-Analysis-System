import React from 'react';
import { Button } from "./ui/button";


interface Props{
    showInput: boolean,
    show: (event: React.FormEvent)=> void,

}
const ShowInputButton = ({ showInput, show }:Props) => {


    return (
        <>
            <Button onClick={show}>
                {showInput ? "Hide Input" : "Show Input"}
            </Button>
        </>
    );
};

export default ShowInputButton;
