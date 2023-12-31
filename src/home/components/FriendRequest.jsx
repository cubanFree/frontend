import React from 'react'
import { Tooltip, Link, User, ScrollShadow, Button } from "@nextui-org/react";
import { HiOutlineRefresh } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { Toaster, toast } from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import avatarDefault from "../../assets/avatar.jpg";

const URL_TARGET = 'https://chats-backend-api.vercel.app'

function FriendRequest({id, isRefresh, onRefresh = f => f}) {

    const [getRequests, setRequests] = React.useState([])

    // delete request received
    const deleteRequest = (event, idContact) => {
        event.preventDefault();
                            
        fetch(`${URL_TARGET}/delete-request/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idContact: idContact
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data) {
                onRefresh(!isRefresh)
                setTimeout(() => {
                    toast.success(data.message);
                }, 0)
            } else {
                toast.error(data.message);
            }
        })
        .catch((err) => {
            console.error('Error al eliminar la solicitud :(', err);
        })

        return null;
    }

    // accept request recived
    const acceptRequest = (event, idContact) => {
        event.preventDefault()

        fetch(`${URL_TARGET}/add-contact/${id}`, 
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idContact: idContact
            })
        }
        )
        .then(response => response.json())
        .then(data => {
            if(data) {
                onRefresh(!isRefresh)
                setTimeout(() => {
                    toast.success(data.message);
                }, 0)
            } else {
                toast.error(data.message);
            }
        })
        .catch((err) => {
            console.error('Error al agregar contacto :(', err);
        })

        return null;
    }

    // loop requests received
    const loopRequests = (idContact, username) => {

        return (
            <div key={idContact} className='w-full flex justify-between gap-4 items-center font-semibold hover:bg-gray-600 p-2'>
                <User   
                    name={username}
                    avatarProps={{
                        src: avatarDefault,
                        size: "lg",
                    }}
                    isFocusable={false}
                />
                <div className='flex justify-center items-center gap-4'>
                    <Button 
                        color='success' 
                        size='sm' 
                        className='bg-green-500 font-semibold'
                        onClick={(e) => acceptRequest(e, idContact)}
                        >
                        Confirm
                    </Button>
                    <div 
                        className='ml-4 cursor-pointer'
                        onClick={(e) => deleteRequest(e, idContact)}
                        >
                        <AiOutlineClose color='gray'/>
                    </div>
                </div>
            </div>
        )
    }

    // Get requests
    React.useEffect(() => {
        fetch(`${URL_TARGET}/requests/${id}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            setRequests(data.requests)
        })
        .catch(error => {
            console.error('Error en el Server :(', error);
        })
    }, [id, isRefresh])

  return (
    <div className='bg-gray-800 text-gray-300 col-4 h-[100vh] p-4 flex flex-col gap-4 rounded-tl-2xl border-r-1 border-gray-600'>
        {/* Header */}
        <div className='sticky top-0 flex justify-between'>
            <span className='font-bold text-xl'>
                Friend Requests
            </span>
            {/* Hover refresh icon */}
            <div className='flex justify-end items-center'>
                <Tooltip 
                    content="Refresh" 
                    closeDelay={100} 
                    color='primary' 
                    className='font-semibold'>
                        <Link className='text-decoration-none'>
                            <HiOutlineRefresh 
                                onClick={() => onRefresh()} 
                                className='cursor-pointer' 
                                size={20}
                            />
                        </Link>
                </Tooltip>
            </div>
        </div>

        {/* Requests lists */}
        <ScrollShadow 
            key={uuid} 
            hideScrollBar 
            className="h-[100vh]">
                {getRequests.length === 0
                    ? 
                        <span className='text-gray-400 text-lg flex justify-center items-center'>
                            Not requests yet
                        </span>
                    : getRequests.map((request) => loopRequests(request.id, request.username))
                }
        </ScrollShadow>
        <Toaster />
    </div>
  )
}

export default FriendRequest;