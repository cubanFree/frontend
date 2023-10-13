import { Spinner } from '@nextui-org/react';

function LoadingVar() {
  return (
        // Loading
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <Spinner 
                color="warning" 
                size='lg'
            />
            <span className='text-lg md:text-xl text-white flex justify-center items-center'>
                Loading...
            </span>
        </div>
    )
}

export default LoadingVar;