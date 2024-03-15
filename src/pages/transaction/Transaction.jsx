import React from "react";
import "./transaction.css";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import useFetch from "../../hooks/useFetch";

const Transaction = () => {
  const { data } = useFetch(`/transactions`);
  return (
    <>
      <div className="tContainer">
        <Navbar />
        <div className="transactions">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Price</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{item.hotel}</td>
                  <td>{item.rooms.join("--")}</td>
                  <td>{item.totalPrice}</td>
                  <td>{item.payment}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MailList />
      </div>
    </>
  );
};

export default Transaction;
