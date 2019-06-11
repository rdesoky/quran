import React, { useEffect } from "react";
import Modal from "react-responsive-modal";

const GotoPage = ({ onClose }) => {
	return (
		<Modal open={true} onClose={onClose}>
			<div style={{ minWidth: "400px", minHeight: "100px" }}>Goto Page</div>
			<button onClick={onClose}>Go</button>
		</Modal>
	);
};

export default GotoPage;
