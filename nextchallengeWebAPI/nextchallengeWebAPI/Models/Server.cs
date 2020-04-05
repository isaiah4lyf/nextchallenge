using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class Server
    {
        [XmlIgnore]
        public ObjectId _id { set; get; }
        public string Name { set; get; }
        public List<string> Roles { set; get; }
        public string Description { set; get; }
        public string Location { set; get; }
        public List<ServerPort> Ports { set; get; }
        public List<ServerIPAddress> IPAddresses { set; get; }
    }
    public class ServerPost
    {
        public string _id { set; get; }
        public string Name { set; get; }
        public List<string> Roles { set; get; }
        public string Description { set; get; }
        public string Location { set; get; }
        public List<ServerPort> Ports { set; get; }
        public List<ServerIPAddress> IPAddresses { set; get; }
    }
    public class ServerPort
    {
        public string Name { set; get; }
        public int Port { set; get; }
        public string Description { set; get; }
    }
    public class ServerIPAddress
    {
        public string Name { set; get; }
        public string IPAddress { set; get; }
        public string Description { set; get; }
    }
    public class ServerConverter
    {
        public Server Convert(ServerPost server)
        {
            return new Server()
            {
                _id = server._id == null ? ObjectId.Parse("000000000000000000000000") : ObjectId.Parse(server._id),
                Name = server.Name,
                Roles = server.Roles,
                Description = server.Description,
                Ports = server.Ports,
                Location = server.Location,
                IPAddresses = server.IPAddresses
            };
        }
    }
}   