const UserAvatar = ({ w = "10" }: { w?: string }) => {
  const avatar = localStorage.getItem("avatar");
  return <img src={avatar || ""} alt="avatar" className={`w-${w} `} />;
};

export default UserAvatar;
