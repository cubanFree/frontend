import React, { useEffect } from 'react'
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button, Link, Badge } from '@nextui-org/react';
import avatarDefault from '../../assets/avatar.jpg';
import { BsKey, BsLaptop, BsChatLeftTextFill } from 'react-icons/bs';
import { FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingVar from '../LoadingVar';

const URL_TARGET = 'http://localhost:5000'

function InfoVar({id, username, isRefresh, isOpenChat, onState = f => f, onLogout = f => f}) {

    const [isRequests, setIsRequests] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(false)
    

    const navegate = useNavigate()

    // Log out function
    const logOut = (event) => {
        event.preventDefault()
        setIsLoading(true)
        localStorage.clear()
        onLogout(true)
        setIsLoading(false)
        return navegate('/')
    }

    // Get requests of Host
    useEffect(() => {
        fetch(`${URL_TARGET}/requests/${id}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setIsRequests(data.requests)
            })
            .catch(error => {
                console.error('Error en el Server para buscar solicitudes en InfoVar :(', error);
            })
    }, [isRefresh, id])

  return (                                       
        isLoading
            ? (
                <LoadingVar />
            ) : (
                <div className={'p-3 col-1 col-s-12 flex md:flex-col md:flex justify-between items-center md:h-[100vh]' + (isOpenChat ? ' hidden' : '')}>
                    <div className='flex md:flex-col justify-center items-center md:gap-1 gap-5'>

                        {/* Contacts */}
                        <Link 
                            className='cursor-pointer hover:bg-gray-800 rounded-lg p-3'
                            onClick={() => onState('contacts')}>
                                <BsChatLeftTextFill 
                                    size={25} 
                                    color='yellow'
                                />   
                        </Link>

                        {/* Friends requests */}
                        <Link 
                            className='cursor-pointer hover:bg-gray-800 rounded-lg p-3 relative'
                            onClick={() => onState('friends-requests')}>
                                {isRequests.length > 0 
                                    ?
                                        <Badge 
                                            content={isRequests.length}
                                            variant='shadow'
                                            className='border-0 bg-yellow-500 font-semibold rounded-md'
                                            size='sm'>
                                                <FaUserFriends 
                                                    size={30} 
                                                    color='white'
                                                />
                                        </Badge>
                                    : 
                                        <FaUserFriends 
                                            size={30} 
                                            color='white'
                                        />
                                }
                        </Link>
                    </div>

                    {/* Info user button */}
                    <Dropdown placement="bottom-start" className='flex justify-center items-center'>
                        <DropdownTrigger>
                            <Avatar
                                as="button"
                                isBordered={true}
                                src={avatarDefault}
                                radius='lg'
                            />
                        </DropdownTrigger>

                        <DropdownMenu 
                            aria-label="User Actions" 
                            variant="flat">

                                {/* Name user */}
                                <DropdownItem 
                                    key="header" 
                                    className="h-10 gap-2" 
                                    variant='menu' 
                                    textValue='hello_user'>
                                        <div className='flex items-center cursor-default justify-end'>
                                            <p className="font-semibold flex items-center">
                                                Hello <span className='font-bold ml-2 bg-warning-300 p-1 rounded-md'>{ username }</span>
                                            </p>
                                        </div>
                                </DropdownItem>

                                {/* General option */}
                                <DropdownItem 
                                    key="general" 
                                    className="h-10 gap-2" 
                                    textValue='general'>
                                        <div className='flex items-center'>
                                            <BsLaptop size={20}/>
                                            <p className="font-bold flex m-2">
                                                General
                                            </p>
                                        </div>
                                </DropdownItem>

                                {/* Account option */}
                                <DropdownItem 
                                    key="account" 
                                    className="h-10 gap-2" 
                                    textValue='account'>
                                        <div className='flex items-center'>
                                            <BsKey size={20}/>
                                            <p className="font-bold m-2">
                                                Account
                                            </p>
                                        </div>
                                </DropdownItem>
                                
                                {/* Logout option */}
                                <DropdownItem 
                                    key="logout" 
                                    color="warning" 
                                    className='border-2 text-end p-0' 
                                    textValue='logout'
                                    onClick={(e) => logOut(e)}>                        
                                        <Button 
                                            as={Link}
                                            className='font-semibold bg-dark'
                                            onClick={(e) => logOut(e)}>
                                                Log Out
                                        </Button>                        
                                </DropdownItem>
                                
                        </DropdownMenu>
                    </Dropdown>
                </div>
            )
  )
}

export default InfoVar;