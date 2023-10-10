import React, { useEffect } from 'react'
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button, Link, Badge } from '@nextui-org/react';
import avatarDefault from '../../assets/avatar.jpg';
import { BsKey, BsLaptop, BsChatLeftTextFill } from 'react-icons/bs';
import { FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function InfoVar({id, username, isRefresh, onState = f => f}) {

    const [avatar, setAvatar] = React.useState(avatarDefault)
    const [isRequests, setIsRequests] = React.useState([])

    const navegate = useNavigate()

    // Log out function
    const logOut = (event) => {
        event.preventDefault()
        localStorage.removeItem('userId')
        localStorage.removeItem('idContact')
        navegate('/')
    }

    // Get requests of Host
    useEffect(() => {
        fetch(`https://db-alva-chats.us-east-2.elasticbeanstalk.com/requests/${id}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setIsRequests(data.requests)
            })
            .catch(error => {
                console.error('Error en el Server para buscar solicitudes en InfoVar :(', error);
            })
    }, [isRefresh, id])

  return (
    <div className='p-3 h-[100vh] min-w-[5rem] flex flex-col justify-between items-center'>
            <div className='flex flex-col justify-center items-center gap-1'>

                {/* Contacts */}
                <Link 
                    className='cursor-pointer hover:bg-gray-800 rounded-lg p-2'
                    onClick={() => onState('contacts')}>
                        <BsChatLeftTextFill 
                            size={25} 
                            color='yellow'
                        />   
                </Link>

                {/* Friends requests */}
                <Link 
                    className='cursor-pointer hover:bg-gray-800 rounded-lg p-2 relative'
                    onClick={() => onState('friends-requests')}>
                        {isRequests.length > 0 
                            ?
                                <Badge 
                                    content={isRequests.length} 
                                    color="primary" 
                                    variant='shadow' 
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
            <Dropdown placement="bottom-start">
                <DropdownTrigger>
                    <Avatar
                        as="button"
                        isBordered={true}
                        src={avatar}
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
                                <div className='flex items-center cursor-default'>
                                    <p className="font-semibold flex justify-start items-center">
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
                                    className='font-semibold bg-dark'>
                                        Log Out
                                </Button>                        
                        </DropdownItem>
                        
                </DropdownMenu>
            </Dropdown>
    </div>
  )
}

export default InfoVar;