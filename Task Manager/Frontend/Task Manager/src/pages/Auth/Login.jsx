import React, { useState } from "react";
import Authlayout from "../../components/layout/Authlayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/input";
import { validateEmail } from "../../utils/helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)){
      setError('Please Enter the valid email');
      return;
    }

    if(!password){
      setError('Please enter the password')
      return;
    }

    setError(" ");

    // Login api calling
  };
  return (
    <Authlayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-1.25 mb-6">
          Please enter your detail to login in
        </p>

        <form onSubmit={handleLogin}>
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

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
              Login
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an account? {" "}
            <Link className="font-medium text-primary underline"to="/signup">
                Signup
            </Link>
          </p>
        </form>
      </div>
    </Authlayout>
  );
};

export default Login;
