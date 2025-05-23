export default function profileIcon({ profilePic, size }) {
  return (
    <img
      src={profilePic}
      alt="Profile picture"
      className="rounded-full object-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    ></img>
  );
}
