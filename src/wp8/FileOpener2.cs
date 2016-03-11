using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Phone.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Media;
using Windows.Storage;
using System.Diagnostics;
using System.IO;
using System.IO.IsolatedStorage;

namespace WPCordovaClassLib.Cordova.Commands
{
    public class FileOpener2 : BaseCommand
    {

        public async void open(string options)
        {
            string[] args = JSON.JsonHelper.Deserialize<string[]>(options);

            string aliasCurrentCommandCallbackId = args[2];

            try
            {
                // Get the file.
                StorageFile file = await LocateFile(args[0]);

                // Launch the bug query file.
                await Windows.System.Launcher.LaunchFileAsync(file);

                DispatchCommandResult(new PluginResult(PluginResult.Status.OK), aliasCurrentCommandCallbackId);
            }
            catch (FileNotFoundException)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.IO_EXCEPTION), aliasCurrentCommandCallbackId);
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR), aliasCurrentCommandCallbackId);
            }
        }

        private async Task<StorageFile> LocateFile(string path)
        {
            // Interpret paths starting with slash as reference to isolated storage; otherwise, treat them as full paths
            if (path.StartsWith("/"))
            {
                return await StorageFile.GetFileFromApplicationUriAsync(new Uri("ms-appdata:///local/" + path));
            }
            return await StorageFile.GetFileFromPathAsync(path);
        }

    }
}