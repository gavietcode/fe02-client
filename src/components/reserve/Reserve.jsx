import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

import "./reserve.css";
import useFetch from "../../hooks/useFetch";
import { useContext, useState } from "react";
import { SearchContext } from "../../context/SearchContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Reserve = ({ setOpen, hotelId }) => {
  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [rooms, setRooms] = useState([]);

  const { data } = useFetch(`/hotels/room/${hotelId}`);
  const { dates } = useContext(SearchContext); //
  const [dataSearch, setDataSearch] = useState(dates);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  const days = dayDifference(dataSearch[0].endDate, dataSearch[0].startDate);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const alldates = getDatesInRange(
    dataSearch[0].startDate,
    dataSearch[0].endDate
  );

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );

    return !isFound;
  };

  const totalPrice = (selectedRooms) => {
    let total = 0;
    selectedRooms.map((item) => {
      const dataRoom = data.find((sItem) =>
        sItem.roomNumbers.some((roomNumber) => roomNumber._id === item)
      );
      total = total + dataRoom.price * days;
    });
    console.log("selectedRooms: ", selectedRooms);
    console.log("Total: ", total);
    return total;
  };

  const dateBooking = (date) => {
    let yyyy = date.getFullYear();
    let mm = date.getMonth();
    let dd = date.getDate();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }

    return dd + "/" + mm + "/" + yyyy;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;

    let roomNumber;

    data.map((room) => {
      room.roomNumbers.map((item) => {
        if (item._id === value) {
          roomNumber = item.number;
        }
      });
    });

    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );

    setRooms(
      checked
        ? [...rooms, roomNumber]
        : rooms.filter((item) => item === roomNumber)
    );
  };

  const handleChangeMethod = (e) => {
    setPaymentMethod(e.target.value);
  };

  const navigate = useNavigate();

  const handleClick = async () => {
    if (totalPrice(selectedRooms) === 0) {
      alert("Please slect the room before book!");
    } else {
      try {
        await Promise.all(
          selectedRooms.map((roomId) => {
            const res = axios.put(`/rooms/availability/${roomId}`, {
              dates: alldates,
            });
            return res.data;
          })
        );

        axios
          .post("/transactions", {
            username: user.username,
            hotels: hotelId,
            rooms: rooms,
            roomId: selectedRooms,
            dateStart: dateBooking(dataSearch[0].startDate),
            dateEnd: dateBooking(dataSearch[0].endDate),
            totalPrice: totalPrice(selectedRooms),
            payment: paymentMethod,
            status: "Booked",
          })
          .then((res) => {
            alert("Room booked successfully!.");
            setOpen(false);
            navigate("/transaction");
            return res.data;
          });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };
  return (
    <>
      <div className="reserve">
        <div className="rContainer">
          <FontAwesomeIcon
            icon={faCircleXmark}
            className="rClose"
            onClick={() => setOpen(false)}
          />
          <div className="rInfo">
            <div className="rDates">
              <h2>Dates</h2>
              <DateRange
                editableDateInputs={true}
                onChange={(item) => setDataSearch([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={dataSearch}
                className="date"
                minDate={new Date()}
              />
            </div>
            <div className="rDetails">
              <h2>Reserve Info</h2>
              <label htmlFor="name">YOUR FULL NAME</label>
              <input
                type="text"
                placeholder="Full Name"
                id="name"
                defaultValue={user.username}
              />
              <label htmlFor="email">YOUR EMAIL</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                defaultValue={user.email}
              />
              <label htmlFor="phone">YOUR PHONE</label>
              <input
                type="text"
                placeholder="Phone"
                id="phone"
                defaultValue={user.phone}
              />
              <label htmlFor="card">YOUR ID CARD</label>
              <input type="text" placeholder="Card" id="card" />
            </div>
          </div>
          <div className="method">
            <div></div>
            <div className="sRooms">
              <span>Select your rooms:</span>
              {data.map((item) => (
                <div className="rItem" key={item._id}>
                  <div className="rItemInfo">
                    <div className="rTitle">{item.title}</div>
                    <div className="rDesc">{item.desc}</div>
                    <div className="rMax">
                      Max people: <b>{item.maxPeople}</b>
                    </div>
                    <div className="rPrice">{item.price}</div>
                  </div>
                  <div className="rSelectRooms">
                    {item.roomNumbers.map((roomNumber, key) => (
                      <div className="room" key={key}>
                        <label>{roomNumber.number}</label>
                        <input
                          type="checkbox"
                          value={roomNumber._id}
                          onChange={handleSelect}
                          disabled={!isAvailable(roomNumber)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rTotal">
            <h3>Total: ${totalPrice(selectedRooms)}</h3>
            <select name="paymentMethod" onChange={handleChangeMethod}>
              <option value="paymentMethod">Selecte Method!</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <button onClick={handleClick} className="rButton">
            Reserve Now!
          </button>
        </div>
      </div>
    </>
  );
};

export default Reserve;
