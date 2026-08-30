import React, { useState } from 'react'
import Authlayout from '../../components/layout/Authlayout'
import ProfilePhotoSelector from '../../components/inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/input';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);

  //handle signup 
  const handleSignup = async (e) => {
    e.preventDefault();

    if(!fullName){
      setError('Please Enter a full name')
      return;
    }

    if(!validateEmail(email)){
          setError('Please Enter the valid email');
          return;
        }
    
        if(!password){
          setError('Please enter the password')
          return;
        }
    
        setError(" ");
  };

  return (
    <Authlayout>
      <div className='lg:w-full h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center' >
        <h3 className='text-xl font-semibold text-black'>Create account</h3>
        <p className='text-xs text-slate-700 mt-1.25 mb-6 '>
          Join us today by entering your detail below
        </p>

        <form onSubmit={handleSignup}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input 
            value={fullName} 
            onChange={({target}) => setFullName(target.value)} 
            label='Full Name' 
            placeholder='John' 
            type='text'
            />

            <Input
            type="text"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
          />

          <Input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Enter your password"
          />

          <Input
            type="password"
            value={adminInviteToken}
            onChange={({ target }) => setAdminInviteToken(target.value)}
            label="Admin Invite Token"
            placeholder="Enter your password"
          />
      </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
              SignUp
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
            Do you have account already {" "}
            <Link className="font-medium text-primary underline"to="/login">
                Login
            </Link>
          </p>
        </form>
      </div>
    </Authlayout>
  )
}

export default Signup
