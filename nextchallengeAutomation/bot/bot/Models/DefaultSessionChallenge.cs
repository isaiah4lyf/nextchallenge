﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace nextchallengeWebAPI.Models
{
    public class DefaultSessionChallenge
    {
        public string _id { set; get; }
        public string Answer { set; get; }
        public bool Active { set; get; }
        public string Category { set; get; }
        public Clue Clue { set; get; }
        public DateTime CreateDateTime { set; get; }
        public int Points { set; get; }
        public string Question { set; get; }
        public int TimeInSeconds { set; get; }

    }
    public class DefaultSessionChallengeStats
    {
        public int LikesCount { set; get; }
        public int DislikesCount { set; get; }
        public bool PostLiked { set; get; }
        public bool PostDisLiked { set; get; }
    }
    public class Clue
    {
        public string Type { set; get; }
        public string Description { set; get; }
        public string Source { set; get; }
        public string By { set; get; }
        public string Licence { set; get; }
        public string LicenceReference { set; get; }
        public List<FileUpload> Files { set; get; }
    }
    public class FileUpload
    {
        public string _id { get; set; }
        public string FileName { set; get; }
        public string UserID { set; get; }
        public string FileType { set; get; }
        public DateTime UploadDateTime { set; get; }
        public List<string> FilePosterUrls { set; get; }
        public List<string> FileBaseUrls { set; get; }
    }
}