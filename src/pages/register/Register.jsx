import axios from "axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { RiFolderUploadLine } from "react-icons/ri";
import "./register.css";

const Register = () => {
  const { loading, error } = useContext(AuthContext);
  const [file, setFile] = useState("");
  const [info, setInfo] = useState({});

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "upload");
    try {
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dnlbxxyzs/image/upload",
        data
      );

      const { url } = uploadRes.data;

      const newUser = {
        ...info,
        img: url,
      };

      await axios.post("/auth/register", newUser);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="register">
      <div className="re-Container">
        <div className="left">
          <img
            src={
              file
                ? URL.createObjectURL(file)
                : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
            }
            alt=""
          />
        </div>
        <div className="formInput">
          <label htmlFor="file">
            Image: <RiFolderUploadLine size={40} />
          </label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>
        <div className="right">
          <input
            type="text"
            placeholder="username"
            id="username"
            onChange={handleChange}
            className="re-Input"
          />
          <input
            type="email"
            placeholder="email"
            id="email"
            onChange={handleChange}
            className="re-Input"
          />
          <input
            type="password"
            placeholder="password"
            id="password"
            onChange={handleChange}
            className="re-Input"
          />
          <input
            type="text"
            placeholder="country"
            id="country"
            onChange={handleChange}
            className="re-Input"
          />
          <input
            type="text"
            placeholder="city"
            id="city"
            onChange={handleChange}
            className="re-Input"
          />
          <input
            type="text"
            placeholder="phone"
            id="phone"
            onChange={handleChange}
            className="re-Input"
          />
          <button
            disabled={loading}
            onClick={handleClick}
            className="re-Button"
          >
            Register
          </button>
          {error && <span>{error.message}</span>}
        </div>
      </div>
    </div>
  );
};

export default Register;
