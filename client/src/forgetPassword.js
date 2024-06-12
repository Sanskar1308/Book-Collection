import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgetPassword = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
    }),
    onSubmit: (values) => {
      axios
        .post("/forgetPassword", values)
        .then((response) => {
          toast.success("Email sent successfully");
        })
        .catch((error) => {
          if (error.response.status === 404) {
            toast.error("Email not found");
          } else {
            toast.error("Server error");
          }
        });
    },
  });

  return (
    <div className="forget-password-container">
      <h2>Forget Password</h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={
              formik.touched.email && formik.errors.email ? "input-error" : ""
            }
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="error-message">{formik.errors.email}</div>
          ) : null}
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgetPassword;
