import React, { useEffect } from 'react'
import { Input, User, ScrollShadow, Tooltip, Link, Button } from '@nextui-org/react'
import { HiOutlineRefresh } from 'react-icons/hi'
import { Toaster, toast } from 'react-hot-toast'
import { OpenChat } from '../ChatScreen'

function ContactVar(
        {
            id, 
            usernameHost, 
            isRefresh, 
            containerRef, 
            onRefresh = f => f, 
            onChat = f => f
        }
    ) {

    const [searchContact, setSearchContact] = React.useState('')
    const [contacts, setContacts] = React.useState([])
    const [filteredContacts, setFilteredContacts] = React.useState(contacts || null)
    const [userOnChats, setUserOnChats] = React.useState(null)
    const [isRequestSend, setIsRequestSend] = React.useState(false)

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
            fetch(`mongodb+srv://alva:W3McwUx5hAZInXU3@alva.nmib9zn.mongodb.net/search/${username}`, { method: 'GET' }),
            fetch(`mongodb+srv://alva:W3McwUx5hAZInXU3@alva.nmib9zn.mongodb.net/requests-sends/${id}`, { method: 'GET' })
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
    } 

    // Send invitation
    const sendInvitation = (event, idContact) => {
        event.preventDefault()

        fetch(`mongodb+srv://alva:W3McwUx5hAZInXU3@alva.nmib9zn.mongodb.net/invite/${id}`, 
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
                toast.success(data.message)
                setIsRequestSend(true)
            } else {
                toast.error(data.message)
            }
        })
        .catch(error => {
            console.error('Error en el envio de solucitud :(', error);
        })
    }

    // Cancel invitation
    const cancelInvitation = (event, idContact) => {
        event.preventDefault()

        fetch(`mongodb+srv://alva:W3McwUx5hAZInXU3@alva.nmib9zn.mongodb.net/cancel-request/${id}`, {
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
                toast.success(data.message)
                setIsRequestSend(false)
            } else {
                toast.error(data.message)
            }
        })
        .catch(error => {
            console.error('Error al cancelar la solicitud :(', error);
        })
    }

    // Loop contacts
    const loopContacts = (idContact, username) => {

        // Check if user is on contacts
        const isOnContact = contacts.some(contact => contact.username === username)

        return (
            <div 
                key={idContact} 
                className='w-full flex justify-between items-center font-semibold hover:bg-gray-600 cursor-pointer p-2'
                onClick={(e) => {
                    e.preventDefault();
                    localStorage.setItem('idContact', idContact)
                    OpenChat({id, containerRef, onChat, onRefresh})
                }}
                >
                <User   
                    name={username}
                    avatarProps={{
                        src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                        size: "lg",
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
        fetch(`mongodb+srv://alva:W3McwUx5hAZInXU3@alva.nmib9zn.mongodb.net/contacts/${id}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            setContacts(data.contacts)
        })
        .catch(error => {
            console.error('Error al obtener los contactos del usuario:', error);
        })
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
        toast.success('Refreshed contacts!')
    }, [isRefresh, searchContact === ''])

  return (
    <div className='bg-gray-800 text-gray-300 sm:min-w-[20rem] md:min-w-[25rem] h-[100vh] p-4 flex flex-col gap-4 rounded-tl-2xl border-r-1 border-gray-600'>
        {/* Header */}
        <div className='sticky top-0 flex flex-col gap-4'>
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
            <Input
                variant="bordered"
                placeholder="Search for a contact"
                className="w-full flex"
                radius='sm'
                color='warning'
                onChange={(e) => setSearchContact(e.target.value)}
                onKeyUp={(e) => capEvent(e, () => searchOnChats(e, searchContact))}
            />
        </div>
        <ScrollShadow 
            hideScrollBar 
            className="h-[100vh]">
                {/* if filteredContacts is empty, show Not contacts */}
                {filteredContacts.length === 0
                    ? (!userOnChats 
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
        <Toaster/>
    </div>
  )
}

export default ContactVar;