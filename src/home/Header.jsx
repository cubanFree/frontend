import React, { useEffect } from 'react'
import {
    Card, 
    CardHeader, 
    CardBody, 
    CardFooter, 
    Link, 
    Input, 
    Button, 
    PopoverTrigger, 
    Popover, 
    PopoverContent,
    Image} from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';
import { FiHelpCircle } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import image from '../assets/fondox.png'
import LoadingVar from './LoadingVar';

const URL_TARGET = 'http://localhost:5000'

const Logo = () => {
    return (
        <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
            <path
                clipRule="evenodd"
                d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    )
}

function Header() {

    const [window, setWindow] = React.useState(true)
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const navegate = useNavigate()

    const signUp = async (event) => {
        event.preventDefault()

        try {
            const response = await fetch(`${URL_TARGET}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })
            
            const data = await response.json()
            if(data.flag) {
                toast.success('Created!')
            } else {
                toast.error(data.message)
            }

            setPassword('')
            setUsername('')
        } catch (error) {
            console.error('Error en el registro :(', error);
        }

        return;
    }

    const signIn = async (event) => {
        event.preventDefault()
      
        // Loading
        setIsLoading(true)

        fetch(`${URL_TARGET}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if(data.flag) {
                    localStorage.setItem('userId', data.id);
                    navegate('/chat')
                } else {
                    setTimeout(() => {
                        toast.error(data.message)
                    }, 0)
                }
            })
            .catch(error => {
                console.error('Error en el registro :(', error);
            })

        await new Promise(resolve => setTimeout(resolve, 0));
        setPassword('')
        setUsername('')
        setIsLoading(false)

        return;
    }

    // Función asincrónica para simular el evento de presionar una tecla
    const capEvent = (event, funct) => {
        if(event.key === 'Enter') {
            funct(event);
        }
    }

    // clear storage
    useEffect(() => {
        localStorage.clear()
    }), [];

    return (
        <div className='min-h-[100vh] flex justify-center items-center bg-gray-900'>
           {
               !isLoading
               ? (
                    <>
                        <div className='absolute md:top-[22.5%] md:flex z-20 mb-[-32px] hidden'>
                            <Image src={image} alt='fondo' layout='fill' className='object-cover'/>
                        </div>
                        <Card className=" bg-gray-600 md:min-w-[400px] min-w-[95%] z-10 absolute md:top-[35%] top-2 shadow-lg">

                            <CardHeader className="flex items-center justify-center gap-4">
                                <Logo />
                            </CardHeader>

                            <CardBody>
                                {
                                    window 
                                    ? (<>
                                        <span className='flex mb-4 text-3xl font-bold text-gray-300'>Sign in to <span className='text-orange-300 px-2'>Chat</span></span>
                                        <div className="flex w-full flex-col gap-3 text-gray-200 bg-dark">
                                            <Input 
                                                isRequired 
                                                classNames={{label: "text-white/75"}} 
                                                variant='underlined' 
                                                type="text" 
                                                label='Username' 
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => capEvent(e, signIn)}
                                            />
                                            <Input 
                                                isRequired 
                                                classNames={{label: "text-white/75"}} 
                                                variant='underlined' 
                                                type="password" 
                                                label='Password' 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => capEvent(e, signIn)}
                                            />
                                        </div></>
                                    )
                                    : (<>
                                        <span className='flex mb-4 text-3xl font-bold text-gray-300'>Create account</span>
                                        <div className="flex w-full flex-col gap-3 text-gray-200">
                                            <Input 
                                                isRequired 
                                                classNames={{label: "text-white/75"}} 
                                                variant='underlined' 
                                                type="text" 
                                                label='Set username' 
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => capEvent(e, signUp)}
                                            />
                                            <Input 
                                                isRequired 
                                                classNames={{label: "text-white/75"}} 
                                                variant='underlined' 
                                                type="password" 
                                                label='Set password' 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => capEvent(e, signUp)}
                                            />
                                            <div
                                                className='w-full flex flex-col items-end'>
                                                <Popover placement="bottom" showArrow={true}>
                                                    <PopoverTrigger>
                                                        <Link>
                                                            <FiHelpCircle color='yellow'/>
                                                        </Link>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="bg-white pl-7">
                                                        <div className="px-1 py-2">
                                                            <ul className='list-disc flex flex-col justify-center items-center'>
                                                                <li>Least 8 characters long</li>
                                                            </ul>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div></>
                                    )
                                }
                            </CardBody>

                            <CardFooter className='flex flex-col items-start gap-2'>
                                {
                                    window
                                    ? (<>
                                        <span className='text-gray-200'>Don`t have an account? <Link className='cursor-pointer text-yellow-400' onClick={() => {setWindow(!window); setPassword(''); setUsername('')}}>Sign up</Link></span>
                                        <Button type='submit' className='w-full flex bg-blue-400 text-white font-semibold text-md' onClick={(e) => signIn(e)}>Get Started</Button></>
                                    )
                                    : (<>
                                        <span className='text-gray-200'>Do you have an account? <Link className='cursor-pointer text-yellow-400' onClick={() => {setWindow(!window); setPassword(''); setUsername('')}}>Log in</Link></span>
                                        <Button isDisabled={!username || password.length < 8} type='submit' className='w-full flex bg-blue-400 text-white font-semibold text-md' onClick={(e) => signUp(e)}>Create account</Button></>
                                    )
                                }
                            </CardFooter>

                        </Card>

                        <div className='absolute flex justify-center items-center bottom-0 w-full z-10'>
                            <span className='text-gray-400 flex justify-center items-center'><Logo />© 2023 Create by ALVA</span>
                        </div>

                        <Toaster position='top-center' />
                    </>
               ) : (
                   <LoadingVar />
               )
           }
        </div>
    )
}

export default Header;