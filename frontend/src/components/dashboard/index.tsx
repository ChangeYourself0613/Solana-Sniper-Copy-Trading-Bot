"use client"
import ToggleBtn from "@/components/buttons/toggle"
import RectButton from "@/components/buttons/button"
import { useEffect, useState } from "react";
import { submit } from "@/lib/func";
import { FiClock, FiTag, FiCheckCircle, FiXCircle } from 'react-icons/fi'

export const Dashboard = () => {
    const [compoundingChecked, setCompoundingChecked] = useState(false);
    const [sequencingChecked, setSequencingChecked] = useState(false);
    const [profitBasedStopChecked, setProfitBasedStopChecked] = useState(false);
    const [timeBasedSellChecked, setTimeBasedSellChecked] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [isToast, setIsToast] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const setCheckedList = [
        setCompoundingChecked,
        setSequencingChecked,
        setProfitBasedStopChecked,
        setTimeBasedSellChecked
    ]

    const checkedList = [
        compoundingChecked,
        sequencingChecked,
        profitBasedStopChecked,
        timeBasedSellChecked
    ]

    const toggleNameList = [
        "Compounding",
        "Sequencing",
        "Profit Based Stop",
        "Time Based Sell"
    ]

    const toggleList = toggleNameList.map((toggle, index) => {
        return (
            <ToggleBtn
                key={index}
                toggleName={toggle}
                checked={checkedList[index]}
                setChecked={setCheckedList[index]}
            />
        )
    })

    const showNotification = (isSuccess: boolean) => {
        setIsToast(true)
        setIsSuccess(isSuccess)
        setTimeout(() => {
            setIsToast(false)
            setIsSuccess(false)
        }, 3000);
    }

    const setSubmit = async () => {
        try {
            await submit({
                compoundingChecked,
                sequencingChecked,
                profitBasedStopChecked,
                timeBasedSellChecked
            })
            showNotification(true)
        } catch (err) {
            showNotification(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-200 duration-200">
            <div className="w-[90%] md:w-[50%] max-w-[680px] h-[50%] bg-white flex flex-col justify-between items-center gap-10 p-10 rounded-xl shadow-md">

                <div className="flex flex-col w-full lg:w-[80%] mt-10 h-[250px] justify-between items-between">
                    {toggleList}
                </div>

                <div className="w-full flex justify-center items-center w-full lg:w-[80%] pl-10 pr-10">
                    <RectButton buttonName="Submit"
                        color="blue"
                        onClick={() => {
                            setIsModal(true)
                        }} />
                </div>
            </div>
            <div className={`absolute top-0 left-0 w-full h-full bg-gray-900 duration-300 ${!isModal ? "z-[-1] opacity-0" : "z-1 opacity-50"}`}
                onClick={() => {
                    setIsModal(false)
                }}>

            </div>

            <div className={`absolute transition-1/2-x flex flex-col gap-5 p-5 justify-center items-center ${!isModal ? "z-[-1] w-[1px] h-[1px]" : "z-2 w-[90%] md:w-[500px]  h-[200px]"} bg-white rounded-xl shadow-md opacity-100 z-2 duration-300`}>
                <p className={`duration-300 ${isModal ? "text-xl" : "text-[1px]"}`}>
                    {isModal ? "Are you sure you want to submit?" : ""}
                </p>
                <div className="flex flex-col sm:flex-row gap-5 w-full">
                    <RectButton
                        buttonName="Yes"
                        color="green"
                        onClick={() => {
                            setIsModal(false)
                            setSubmit()
                        }} />
                    <RectButton buttonName="No"
                        color="red"
                        onClick={() => {
                            setIsModal(false)
                        }} />
                </div>
            </div>

            <div className={`absolute related top-10 right-10 ${isToast ? "w-[300px]  h-[50px] pl-5" : " w-[0px] h-[50px]"} ${isSuccess ? "bg-green-300" : "bg-red-300"} rounded-md flex justify-between items-center duration-300`}>
                {
                    isToast && (
                        <div>
                            {
                                isSuccess ?
                                    <FiCheckCircle className="w-5 h-5" /> :
                                    <FiXCircle className="w-5 h-5" />
                            }
                            <div className="absolute  top-0 left-0 w-full h-full flex justify-center items-center">
                                <p>{isSuccess ? "Success" : "Error"}</p>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
