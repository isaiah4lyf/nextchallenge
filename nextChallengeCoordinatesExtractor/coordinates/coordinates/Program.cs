using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace coordinates
{
    class Program
    {
        static void Main(string[] args)
        {
            ExtractWholeCountry();
            //ExtractStatesOrProvinces();
        }
        static void ExtractWholeCountry()
        {
            string str = "";
            using (StreamReader sr = File.OpenText("gadm36_PNG_0.kml"))
            {

                string s = String.Empty;
                while ((s = sr.ReadLine()) != null)
                {
                    str += s;
                }
            }
            string str21 = JsonConvert.SerializeObject(Coordinates(str));
            File.WriteAllText("gadm36_PNG_0.txt", str21);
        }
        static void ExtractStatesOrProvinces()
        {
            string str = "";
            using (StreamReader sr = File.OpenText("gadm36_ZAF_1.kml"))
            {

                string s = String.Empty;
                while ((s = sr.ReadLine()) != null)
                {
                    str += s;
                }
            }
            string[] arr = str.Split(new string[] { "<Placemark>" }, StringSplitOptions.None);
            Console.WriteLine(arr.Length);
            List<string> strings = new List<string>();
            for (int i = 1; i < arr.Length; i++)
            {
                strings.Add(arr[i].Split(new string[] { "</Placemark>" }, StringSplitOptions.None)[0]);
            }
            string str21 = JsonConvert.SerializeObject(Coordinates(strings.ElementAt(9)));

            File.WriteAllText("gadm36_ZAF_1.txt", str21);
            Console.ReadLine();
        }
        static List<string> Coordinates(string str)
        {
            string[] arr = str.Split(new string[] { "<coordinates>" }, StringSplitOptions.None);
            Console.WriteLine(arr.Length);
            List<string> strings = new List<string>();
            for (int i = 1; i < arr.Length; i++)
            {
                strings.Add(arr[i].Split(new string[] { "</coordinates>" }, StringSplitOptions.None)[0]);
            }
            return strings;
        }
    }
}
