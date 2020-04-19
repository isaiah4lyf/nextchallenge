using MediaToolkit;
using MediaToolkit.Model;
using MediaToolkit.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using nextchallengeWebAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;


namespace nextchallengeWebAPI.Helpers
{
    public class FileManager
    {
        public List<FileUpload> UploadFiles(MultipartFormDataStreamProvider provider, IMongoDatabase database, string root,string fileType,string userID)
        {
            var collectionFiles = database.GetCollection<FileUpload>("Files");
            List<FileUpload> files = new List<FileUpload>();
            DateTime datetime = DateTime.Now;
            foreach (MultipartFileData file in provider.FileData)
            {
                FileUpload fileUpload = new FileUpload();
                fileUpload.UserID = ObjectId.Parse(userID);
                fileUpload.FileType = fileType;
                fileUpload.FileName = file.Headers.ContentDisposition.FileName.Replace('\"'.ToString(), String.Empty).Replace('"'.ToString(), String.Empty);
                fileUpload.FileBaseUrls = new List<string> { System.Configuration.ConfigurationManager.AppSettings["WebUrl"] };
                fileUpload.UploadDateTime = datetime;
                fileUpload.FilePosterUrls = new List<string>();
                collectionFiles.InsertOne(fileUpload);
                string fileName = fileUpload._id.ToString() + "." + file.Headers.ContentDisposition.FileName.Split('.')[file.Headers.ContentDisposition.FileName.Split('.').Length - 1].Replace('\"'.ToString(), String.Empty);
                File.Move(file.LocalFileName, Path.Combine(root, fileName));
                List<string> newUrls = new List<string>();
                foreach (string fileUpload1 in fileUpload.FileBaseUrls)
                    newUrls.Add(fileUpload1 + "/files/" + fileName);
                fileUpload.FileBaseUrls = newUrls;
                if (fileType == "video")
                {
                    using (var engine = new Engine())
                    {
                        var outputFile = new MediaFile { Filename = root + "/" + fileUpload._id.ToString() + ".jpeg" };
                        var inputFile = new MediaFile { Filename = root + "/" + fileName };
                        fileUpload.FilePosterUrls.Add(System.Configuration.ConfigurationManager.AppSettings["WebUrl"] + "/files/" + fileUpload._id.ToString() + ".jpeg");
                        engine.GetMetadata(inputFile);
                        int atSec = 0;
                        var options = new ConversionOptions { Seek = TimeSpan.FromSeconds(atSec) };
                        if (inputFile.Metadata.Duration.Seconds > 0 && inputFile.Metadata.Duration.Minutes == 0)
                        {
                            if (inputFile.Metadata.Duration.Seconds < 3)
                            {
                                atSec = 1;
                            }
                            else
                            {
                                Random random = new Random();
                                atSec = random.Next(1, inputFile.Metadata.Duration.Seconds - 2);
                            }
                            options = new ConversionOptions { Seek = TimeSpan.FromSeconds(atSec) };
                        }
                        if (inputFile.Metadata.Duration.Minutes > 0 || inputFile.Metadata.Duration.Hours > 0)
                        {
                            Random random = new Random();
                            atSec = random.Next(1, inputFile.Metadata.Duration.Seconds + inputFile.Metadata.Duration.Minutes * 60 + inputFile.Metadata.Duration.Hours * 60 * 60 - 5);
                            options = new ConversionOptions { Seek = TimeSpan.FromSeconds(atSec) };
                        }

                        engine.GetThumbnail(inputFile, outputFile, options);
                    }
                }
                collectionFiles.ReplaceOne(f => f._id == fileUpload._id, fileUpload);
                files.Add(fileUpload);
            }
            return files;
        }
    }
}