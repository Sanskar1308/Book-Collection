import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().required("Required").min(6, "Too Short!"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: (values) => {
      const { newPassword } = values;
      const token = window.location.pathname.split("/").pop();

      axios
        .post(`reset-password/${token}`, { newPassword })
        .then((response) => {
          toast.success(response.data.message);
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        })
        .catch((error) => {
          toast.error("Your link has expired");
        });
    },
  });

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.newPassword}
            className={
              formik.touched.newPassword && formik.errors.newPassword
                ? "input-error"
                : ""
            }
          />
          {formik.touched.newPassword && formik.errors.newPassword ? (
            <div className="error-message">{formik.errors.newPassword}</div>
          ) : null}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className={
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? "input-error"
                : ""
            }
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="error-message">{formik.errors.confirmPassword}</div>
          ) : null}
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
