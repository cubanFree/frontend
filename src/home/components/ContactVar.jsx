import React, { useEffect } from 'react'
import { Input, User, ScrollShadow, Tooltip, Link, Button, Divider } from '@nextui-org/react'
import { HiOutlineRefresh } from 'react-icons/hi'
import { Toaster, toast } from 'react-hot-toast'
import { OpenChat } from '../ChatScreen'
import LoadingVar from '../LoadingVar'
import avatarDefault from '../../assets/avatar.jpg'

const URL_TARGET = 'http://localhost:5000'

function ContactVar(
        {
            id, 
            usernameHost, 
            isRefresh, 
            isOpenChat,
            containerRef, 
            onRefresh = f => f, 
            onChat = f => f,
            onOpenChat = f => f
        }
    ) {

    const [searchContact, setSearchContact] = React.useState('')
    const [contacts, setContacts] = React.useState([])
    const [filteredContacts, setFilteredContacts] = React.useState(contacts || null)
    const [userOnChats, setUserOnChats] = React.useState(null)
    const [isRequestSend, setIsRequestSend] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    // Search the usernameSearch on Data Base
    const searchOnChats = async (event, username) => {
        event.preventDefault();
      
        try {
          if (username === usernameHost) {
            toast.error('You cannot search yourself!');
            return;
          }
      
          // Realizar ambas solicitudes simultáneamente
          const [userDataResponse, requestsSendsResponse] = await Promise.all([
            fetch(`${URL_TARGET}/search/${username}`, { method: 'GET' }),
            fetch(`${URL_TARGET}/requests-sends/${id}`, { method: 'GET' })
          ]);
      
          // Verificar el resultado de la búsqueda de usuarios en la base de datos y establecer en userOnChats
          if (!userDataResponse.ok) {
            throw new Error('User not found!');
          }
          const userData = await userDataResponse.json();
          setUserOnChats(userData);
      
          // Verificar las solicitudes enviadas por el host
          if (!requestsSendsResponse.ok) {
            throw new Error('Error obtaining sent requests.');
          }
          const requestsSendsData = await requestsSendsResponse.json();

          // Verificar si userOnData está presente en requestsSends
          const isRequestSend = requestsSendsData.some(request => request.id === userData.id);
          setIsRequestSend(isRequestSend);
      
        } catch (error) {
          toast.error(error.message);
        }

        return null;
    } 

    // Send invitation
    const sendInvitation = (event, idContact) => {
        event.preventDefault()

        fetch(`${URL_TARGET}/invite/${id}`, 
        { 
            method: 'PATCH' ,
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
                    setIsRequestSend(true)
                    setTimeout(() => {
                        toast.success(data.message)
                    }, 0)
                } else {
                    toast.error(data.message)
                }
            })
            .catch(error => {
                console.error('Error en el envio de solucitud :(', error);
            })

        return null;
    }

    // Cancel invitation
    const cancelInvitation = (event, idContact) => {
        event.preventDefault()

        fetch(`${URL_TARGET}/cancel-request/${id}`, {
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
                    setIsRequestSend(false)
                    toast.success(data.message)
                } else {
                    toast.error(data.message)
                }
            })
            .catch(error => {
                console.error('Error al cancelar la solicitud :(', error);
            })

        return null;
    }

    // Loop contacts
    const loopContacts = (idContact, username) => {

        // Check if user is on contacts
        const isOnContact = contacts.some(contact => contact.username === username)

        const onClickContact = async (event) => {
            event.preventDefault();

            localStorage.setItem('idContact', idContact)
            onOpenChat(true)
            OpenChat({id, containerRef, onChat})

            return null;
        }

        return (
            <React.Fragment key={idContact}>
                <div 
                    className='w-full flex justify-between items-center font-semibold hover:bg-gray-600 rounded-md cursor-pointer py-2'
                    onClick={(e) => onClickContact(e)}>
                        <User   
                            name={username}
                            avatarProps={{
                                src: avatarDefault,
                                size: "lg"
                            }}
                            isFocusable={false}
                        />
                        {!isOnContact &&
                                (!isRequestSend
                                    ?
                                        <Button 
                                            className='bg-yellow-600 font-semibold' 
                                            size='sm'
                                            onClick={(e) => sendInvitation(e, idContact)}>
                                                Invite
                                        </Button>
                                    : 
                                        <Button 
                                            className='bg-yellow-600 font-semibold' 
                                            size='sm'
                                            onClick={(e) => cancelInvitation(e, idContact)}>
                                                Cancel request
                                        </Button>
                                )
                        }
                </div>
                <Divider className='bg-gray-700'/>
            </React.Fragment>
        )
    }

    // event listener on enter
    const capEvent = (event, funct) => {
        if(event.key === 'Enter') {
            funct();
        }
    }

    // Get contacts
    useEffect(() => {
        const getContacts = async () => {
            // Loading
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 0))

            try {
                const response = await fetch(`${URL_TARGET}/contacts/${id}`, { method: 'GET' })
                if (!response.ok) {
                    throw new Error('Error al obtener los contactos del usuario.');
                }

                const data = await response.json()
                if(data) {
                    setContacts(data.contacts)
                }
                
            } catch (error) {
                console.error('Error en el fetch GetContacts:', error);
            } finally {
                setIsLoading(false)
            }
        }

        getContacts()
    }, [id, isRefresh])

    // Filter contacts
    useEffect(() => {
        const filtered = contacts.filter(contact => {
            return contact.username.toLowerCase().includes(searchContact.toLowerCase()) && contact
        })
        setFilteredContacts(filtered)
    }, [searchContact, contacts])

    // Refresh
    useEffect(() => {
        setUserOnChats(null)
        setTimeout(() => {
            toast.success('Refreshed contacts!')
        }, 0)
    }, [isRefresh, searchContact === ''])

  return (
    <div className={'bg-gray-800 text-gray-300 col-4 col-s-12 p-4 rounded-tl-2xl border-r-1 border-gray-600 md:block' + (isOpenChat ? ' hidden' : '')}>
        {/* Header */}
        <div className='flex flex-col gap-2'>
            <span className='font-bold text-xl'>
                Chats
            </span>
            <div className='flex justify-end items-center'>
                {/* Hover refresh icon */}
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
            <div className="w-full flex">
                <Input
                    variant="bordered"
                    placeholder="Search for a contact"
                    radius='sm'
                    color='warning'
                    onChange={(e) => setSearchContact(e.target.value)}
                    onKeyUp={(e) => capEvent(e, () => searchOnChats(e, searchContact))}
                />
            </div>
        </div>
        <div className='flex flex-col mt-1'>
            <ScrollShadow 
                hideScrollBar
                className='h-[55vh] overflow-y-scroll'
                isEnabled={false}>
                    {/* if filteredContacts is empty, show Not contacts */}
                    {filteredContacts.length === 0
                        ? isLoading 
                            ? <LoadingVar />
                            : (!userOnChats 
                                ?
                                    <div className='flex flex-col items-center gap-3'>
                                        <span className='text-gray-400 text-lg text-center'>
                                            Not contacts
                                        </span>
                                        {searchContact && 
                                                <Button 
                                                    className='w-[40%] text-md font-semibold font-sans' 
                                                    size='sm' 
                                                    color='primary' 
                                                    fullWidth={false}
                                                    onClick={(e) => {searchOnChats(e, searchContact)}}>
                                                        Search on Chats
                                                </Button>
                                        }
                                    </div>
                                : loopContacts(userOnChats.id, userOnChats.username)
                            )
                        : filteredContacts.map((data) => loopContacts(data.id, data.username))
                    }
            </ScrollShadow>
        </div>
        <Toaster/>
    </div>
  )
}

export default ContactVar;