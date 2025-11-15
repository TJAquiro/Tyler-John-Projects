import { useState } from "react";
import { uploadImage } from "../../api/imageApi.ts";

/*
Code adapted to Typescript from https://www.geeksforgeeks.org/file-uploading-in-react-js/
- Hugh
*/

const FileUpload = () => {
	const [selectedFile, setSelectedFile] = useState(new File([], ""));

	const onFileChange = (event: any) => {
		setSelectedFile(event.target.files[0]);
	};

	const onFileUpload = async () => {
		if (selectedFile.name == "")
		{
			return;
		}

		const formData = new FormData();
		formData.append(
			"myFile",
			selectedFile,
			selectedFile.name
		);
		console.log(selectedFile);

		await uploadImage(selectedFile.name, selectedFile);
		alert(`Image '${selectedFile.name}' uploaded successfully.`);
	};

	return (
		<div>
			<div>
				<input type="file" onChange={onFileChange} />
				<button onClick={onFileUpload}>Upload!</button>
			</div>
		</div>
	);
};

export default FileUpload;