using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace nextchallengeWebAPI.Models
{
    public class About
    {
        public UserBasicInfo BasicInfo { set; get; }
        public List<Company> Work { set; get; }
        public List<School> Education { set; get; }
        public List<Interest> Interests { set; get; }
    }
}